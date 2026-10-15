import { prisma } from '../../config/database.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors.js';

function toMessageDTO(m) {
  return {
    id: m.id,
    chatId: m.chatId,
    body: m.body,
    createdAt: m.createdAt,
    sender: m.sender
      ? { id: m.sender.id, name: m.sender.name, role: m.sender.role && m.sender.role.name }
      : null,
  };
}

function toChatDTO(chat, currentUserId, unreadCount) {
  unreadCount = unreadCount || 0;
  const otherMember = !chat.isGroup
    ? chat.members.find((m) => m.userId !== currentUserId)
    : null;
  const lastMessage = chat.messages && chat.messages[0] ? chat.messages[0] : null;

  return {
    id: chat.id,
    isGroup: chat.isGroup,
    name: chat.isGroup ? chat.name : (otherMember && otherMember.user ? otherMember.user.name : 'Unknown'),
    otherUser: otherMember && otherMember.user
      ? {
          id: otherMember.user.id,
          name: otherMember.user.name,
          role: otherMember.user.role ? otherMember.user.role.name : null,
        }
      : null,
    members: chat.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      role: m.user.role ? m.user.role.name : null,
    })),
    lastMessage: lastMessage
      ? {
          body: lastMessage.body,
          at: lastMessage.createdAt,
          senderId: lastMessage.senderId,
          senderName: lastMessage.sender ? lastMessage.sender.name : null,
        }
      : null,
    updatedAt: chat.updatedAt,
    unreadCount,
  };
}

export const chatService = {
  async listChats(req) {
    const actor = req.user;
    const memberships = await prisma.chatMember.findMany({
      where: { userId: actor.id },
      include: {
        chat: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    role: { select: { name: true } },
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { sender: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { chat: { updatedAt: 'desc' } },
    });

    const chatIds = memberships.map((m) => m.chatId);
    const myReadMap = new Map(memberships.map((m) => [m.chatId, m.lastReadAt]));

    const unreadMap = new Map();
    if (chatIds.length > 0) {
      const allMessages = await prisma.chatMessage.findMany({
        where: { chatId: { in: chatIds }, senderId: { not: actor.id } },
        select: { chatId: true, createdAt: true },
      });
      allMessages.forEach((m) => {
        const lastRead = myReadMap.get(m.chatId);
        if (!lastRead || m.createdAt > lastRead) {
          unreadMap.set(m.chatId, (unreadMap.get(m.chatId) || 0) + 1);
        }
      });
    }

    return memberships.map((m) =>
      toChatDTO(m.chat, actor.id, unreadMap.get(m.chatId) || 0)
    );
  },

  async getOrCreateDM(req, otherUserId) {
    const actor = req.user;
    if (otherUserId === actor.id) throw new ValidationError('Cannot chat with yourself');

    const other = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, organizationId: true },
    });
    if (!other || other.organizationId !== actor.organizationId) {
      throw new NotFoundError('User not found in your organization');
    }

    const existing = await prisma.chat.findFirst({
      where: {
        organizationId: actor.organizationId,
        isGroup: false,
        AND: [
          { members: { some: { userId: actor.id } } },
          { members: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, role: { select: { name: true } } } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
      },
    });

    if (existing) return toChatDTO(existing, actor.id, 0);

    const created = await prisma.chat.create({
      data: {
        organizationId: actor.organizationId,
        createdById: actor.id,
        isGroup: false,
        members: { create: [{ userId: actor.id }, { userId: otherUserId }] },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, role: { select: { name: true } } } },
          },
        },
        messages: true,
      },
    });

    return toChatDTO(created, actor.id, 0);
  },

  async createGroup(req, name, memberIds) {
    const actor = req.user;
    const uniqueIds = Array.from(new Set([actor.id, ...memberIds]));

    const users = await prisma.user.findMany({
      where: { id: { in: uniqueIds }, organizationId: actor.organizationId },
      select: { id: true },
    });
    if (users.length !== uniqueIds.length) {
      throw new ValidationError('Some users are outside your organization');
    }

    const created = await prisma.chat.create({
      data: {
        organizationId: actor.organizationId,
        createdById: actor.id,
        isGroup: true,
        name,
        members: { create: uniqueIds.map((id) => ({ userId: id })) },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, role: { select: { name: true } } } },
          },
        },
        messages: true,
      },
    });

    return toChatDTO(created, actor.id, 0);
  },

  async listMessages(req, chatId, limit) {
    const actor = req.user;
    const membership = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId: actor.id } },
    });
    if (!membership) throw new NotFoundError('Chat not found');

    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: { select: { id: true, name: true, role: { select: { name: true } } } },
      },
    });

    await prisma.chatMember.update({
      where: { chatId_userId: { chatId, userId: actor.id } },
      data: { lastReadAt: new Date() },
    });

    return messages.map(toMessageDTO);
  },

  async sendMessage(req, chatId, body) {
    const actor = req.user;
    const membership = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId: actor.id } },
    });
    if (!membership) throw new ForbiddenError('Not a member of this chat');

    const message = await prisma.chatMessage.create({
      data: { chatId, senderId: actor.id, body },
      include: {
        sender: { select: { id: true, name: true, role: { select: { name: true } } } },
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return toMessageDTO(message);
  },

  async listUsers(req) {
    const actor = req.user;
    const users = await prisma.user.findMany({
      where: {
        organizationId: actor.organizationId,
        id: { not: actor.id },
        status: 'ACTIVE',
      },
      select: { id: true, name: true, role: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
    return users.map((u) => ({ id: u.id, name: u.name, role: u.role.name }));
  },
};
