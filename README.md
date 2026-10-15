# CRM

Enterprise CRM with AI Assistant, Voice Control, Role-Based Access, and Data Scoping.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js 20 + Express 4 + TypeScript + Prisma 5
- **Database:** PostgreSQL 16
- **Queue:** Redis 7 + BullMQ
- **Auth:** JWT + HTTP-only cookies + bcrypt

## Quick Start

```bash
# 1. Copy environment
cp .env.example .env

# 2. Start PostgreSQL + Redis
docker compose up -d

# 3. Install dependencies (monorepo)
npm install

# 4. Setup database
cd backend
npx prisma migrate dev --name init
npm run db:seed
cd ..

# 5. Run backend + frontend
npm run dev