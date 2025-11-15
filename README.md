# Meme Gallery Hub

A full-stack capstone: backend API (Express/Prisma/S3/JWT) and React frontend.

Monorepo layout:
- backend/ — Express API + Prisma + AWS S3
- meme-library-api-plan/ — planning docs (capstone plan)

Get started (backend):
1) Copy .env.example to .env and fill values.
2) Install deps and generate Prisma client.
3) Run database migrations.
4) Start dev server.

Commands:

```
cd backend
cp .env.example .env
pnpm i # or npm i / yarn
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```
