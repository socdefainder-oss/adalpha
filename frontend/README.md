# Frontend - APP Igreja

Painel de gestao da igreja inspirado no layout operacional fornecido.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS

## Funcionalidades iniciais

- Login JWT integrado ao backend
- Dashboard (visao geral)
- Gestao de membros
- Gestao de ministerios
- Gestao de grupos
- Agenda de eventos
- Lancamentos financeiros

## Rodar local

1. Copie `.env.example` para `.env.local`.
2. Instale dependencias:

```bash
npm install
```

3. Inicie:

```bash
npm run dev
```

App: `http://localhost:3000`

## Deploy na Vercel

- Framework preset: Next.js
- Build command: `npm run build`
- Environment variable:
	- `NEXT_PUBLIC_API_URL` = URL da API no Render (com `/api` no final)
