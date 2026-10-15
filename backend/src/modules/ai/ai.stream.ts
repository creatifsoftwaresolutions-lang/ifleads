import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { aiService } from './ai.service.js';

function sse(res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
}

function send(res: Response, obj: any) {
  res.write(`data: ${JSON.stringify(obj)}\n\n`);
}

/**
 * Streams the reply word-by-word.
 * Calls aiService.chat() ONCE — that internally may call Groq once.
 * Then chunks the reply for the streaming feel.
 */
export async function streamChat(req: AuthRequest, res: Response) {
  const message = String(req.body?.message ?? '').trim();
  if (!message) {
    sse(res);
    send(res, { error: 'empty message' });
    res.end();
    return;
  }

  sse(res);

  try {
    // Send an early "thinking" ping so the client knows we're alive
    send(res, { status: 'thinking' });

    // ONE call to aiService.chat — handles rules + Groq internally
    const reply = await aiService.chat(req, message);

    // Stream the reply text word-by-word (no second API call)
    const words = reply.reply.split(' ');
    let chunk = '';

    for (let i = 0; i < words.length; i++) {
      chunk += (i ? ' ' : '') + words[i];

      // Send in chunks of ~3 words
      if (i % 3 === 2 || i === words.length - 1) {
        send(res, { text: chunk + ' ' });
        chunk = '';
        // Tiny delay so it feels like typing (10ms per chunk)
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    send(res, {
      done: true,
      intent: reply.intent,
      links: reply.links,
    });
    res.end();
  } catch (e: any) {
    send(res, { error: e?.message ?? 'stream failed' });
    res.end();
  }
}
