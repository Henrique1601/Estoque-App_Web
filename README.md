# Controle de Estoque — 3 Lojas

App para gerenciar estoque de três lojas, com valores em dólar convertidos
automaticamente para real (cotação atualizada via AwesomeAPI) e controle de
usuários por loja.

## Stack
- **Frontend**: React 18 + Vite + Tailwind → [Vercel](https://vercel.com)
- **Backend**: Node + Express + JWT → [Railway](https://railway.app)
- **Banco**: PostgreSQL → Railway
- **Auth**: JWT com roles `admin` (vê tudo) e `gerente` (vê só a loja dele)

## Rodando localmente

### 1. Backend
```bash
cd backend
cp .env.example .env   # preencha DATABASE_URL, JWT_SECRET, FRONTEND_URL
npm install
npm run dev
```
O servidor sobe em `http://localhost:3001` e já executa as migrações automaticamente.

### 2. Frontend
```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3001
npm install
npm run dev
```
Abre em `http://localhost:5173`.

### 3. Seed inicial (opcional)
Durante o primeiro startup, o backend cria automaticamente as lojas e o
usuário admin. Para criar o admin manualmente:
```bash
cd backend
node db/seed.js
```
> Altere a senha do admin após o primeiro acesso.

## Deploy

### Backend + banco → Railway
1. Crie um projeto no Railway com PostgreSQL.
2. Adicione um serviço web a partir da pasta `backend`.
3. Configure as variáveis: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.
4. O schema é migrado automaticamente no startup.

### Frontend → Vercel
1. Importe a pasta `frontend` na Vercel.
2. Configure `VITE_API_URL` com a URL do backend no Railway.
3. Deploy.

## Estrutura
- `frontend/src/pages/` — Dashboard, Login, Register, ForgotPassword
- `frontend/src/components/` — Navbar, ProdutoCard, ErrorBoundary
- `frontend/src/context/` — AuthContext, ToastContext
- `frontend/src/hooks/` — useFocusTrap
- `frontend/src/constants/` — coresCelular
- `backend/src/routes/` — auth, produtos, lojas, cotacao
- `backend/src/middleware/` — auth (JWT)
- `backend/db/` — schema.sql, seed.js

## Próximos passos sugeridos
- Adicionar histórico de vendas (tabela `vendas` separada)
- Gráfico de evolução de estoque/vendas por período
- Admin poder editar/criar usuários pela interface
- Upload de imagem do produto
