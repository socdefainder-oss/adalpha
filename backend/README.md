# Backend - APP Igreja

API REST para gestao completa da igreja.

## Stack

- Node.js + Express
- TypeScript
- Store em memoria (sem banco)
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

3. Inicie em desenvolvimento:

```bash
npm run dev
```

API: `http://localhost:4000/api`

Usuario seed:

- email: `admin@appigreja.com`
- senha: `admin123`

Observacao:

- Os dados sao mantidos em memoria. Ao reiniciar o servico, volta para os dados iniciais.

## Deploy no Render

- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment:
  - `JWT_SECRET`
  - `PORT` (Render injeta automaticamente)
  - `CLIENT_URL` (URL do frontend Vercel)
