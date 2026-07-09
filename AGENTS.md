# Estoque-App

## Stack
- Frontend: React 18 + Vite + Tailwind CSS → Vercel
- Backend: Node + Express + JWT → Railway
- Banco: PostgreSQL → Railway

## Comandos
```bash
# Dev
cd frontend && npm run dev
cd backend && npm run dev

# Build
cd frontend && npm run build

# Test
cd frontend && npm run test

# Deploy automático (push para main)
git add -A && git commit -m "msg" && git push
```

## Estrutura
- `frontend/src/pages/` — Dashboard, Login, Register, ForgotPassword
- `frontend/src/components/` — Navbar, ProdutoCard, ErrorBoundary
- `frontend/src/context/` — AuthContext, ToastContext
- `frontend/src/hooks/` — useFocusTrap
- `frontend/src/constants/` — coresCelular (paleta com ~60 cores)
- `backend/src/routes/` — auth, produtos, lojas, cotacao
- `backend/src/middleware/` — auth (JWT)
- `backend/db/` — schema.sql

## Domínio (ver Resumo-Estoque/)
- 3 lojas: Central de Estoque (visão consolidada virtual), Loja Games, Loja Litoral
- Produtos com moeda USD (conversão automática via cotação) ou BRL fixo
- Usuários: admin (vê tudo) ou gerente (vê só a loja dele)
- Register cria gerentes, admin é seed único

## Banco de dados
- `produtos.loja_id` INDEXADO — `idx_produtos_loja_id`
- `produtos.categoria` INDEXADO — `idx_produtos_categoria`
- UNIQUE em `lojas.nome` (evita duplicatas em restarts)
- Migration automática no startup (`migrate.js`)

## Acessibilidade
- Modais com focus trap, Escape fecha, aria-modal, aria-label
- Botões com aria-label, aria-busy, aria-live para loading
- role="alert" em erros, role="tablist" nas abas
- ErrorBoundary global em App.jsx
- prefers-reduced-motion respeitado

## Performance
- Fontes IBM Plex pré-conectadas e pré-carregadas
- content-visibility: auto em listas grandes
- Skeleton loading durante fetch
- Cache de cotação 6h no backend
- Vite bundle com tree-shaking
