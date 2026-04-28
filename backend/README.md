# Backend - APP Igreja

API REST para gestao completa da igreja.

## Stack

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticacao

## Modulos

- Autenticacao e usuarios
- Membros
- Ministerios
- Grupos e frequencia
- Eventos (agenda)
- Financeiro
- Dashboard consolidado

## Como rodar local

1. Copie `.env.example` para `.env` e ajuste as variaveis.
2. Instale dependencias:

```bash
npm install
```

3. Gere cliente prisma e aplique migrations:

```bash
npm run prisma:generate
npx prisma migrate dev --name init
```

4. Rode o seed inicial:

```bash
npm run prisma:seed
```

5. Inicie em desenvolvimento:

```bash
npm run dev
```

API: `http://localhost:4000/api`

Usuario seed:

- email: `admin@appigreja.com`
- senha: `admin123`

## Deploy no Render

- Build Command: `npm install && npm run prisma:generate && npm run build`
- Start Command: `npm run prisma:deploy && npm start`
- Environment:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT` (Render injeta automaticamente)
  - `CLIENT_URL` (URL do frontend Vercel)
