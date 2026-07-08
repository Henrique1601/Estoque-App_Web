# Controle de Estoque — 2 Lojas

App para gerenciar estoque de duas lojas, com valores em dólar convertidos
automaticamente para real (cotação atualizada via AwesomeAPI) e controle de
usuários por loja.

## Stack
- **Frontend**: React + Vite + Tailwind
- **Backend**: Node + Express
- **Banco**: PostgreSQL
- **Auth**: JWT (roles: `admin` e `gerente`)

## Rodando localmente

### 1. Banco de dados
Crie um banco Postgres local (ou use o Railway já na etapa de deploy) e rode:
```bash
psql -d seu_banco -f backend/db/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env      # preencha DATABASE_URL e um JWT_SECRET aleatório
npm install
node db/seed.js           # cria os 3 usuários iniciais (admin + 2 gerentes)
npm run dev
```
O servidor sobe em `http://localhost:3001`.

Usuários criados pelo seed (troque as senhas depois):
- `admin@estoque.com` / `admin123` — vê as duas lojas
- `centro@estoque.com` / `centro123` — só a Loja Centro
- `shopping@estoque.com` / `shopping123` — só a Loja Shopping

### 3.1 Importando uma planilha de estoque existente (opcional)
Se você já tem uma planilha de estoque (como a `LITORAL_E_GAMES.xlsx`), o
projeto já vem com um importador pronto:
```bash
cd backend
npm install        # garante que a lib xlsx está instalada
node db/import_litoral.js /caminho/para/LITORAL_E_GAMES.xlsx
```
Isso cria a loja "Litoral e Games" (se ainda não existir) e importa os
produtos de cada aba como categoria (Geral, Apple, Xiaomi, Games, Perfumes).
A aba "UPGRADE" é ignorada por não ser estoque, e linhas sem preço
preenchido (produtos zerados) também são puladas. Os valores entram como
BRL direto, sem passar pela cotação do dólar.

Se seu banco já existia antes dessa atualização (colunas de moeda/categoria
não existem ainda), rode antes:
```bash
psql -d seu_banco -f backend/db/migrate_moeda.sql
```


### 3. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:3001
npm install
npm run dev
```
Abre em `http://localhost:5173`.

## Deploy

### Backend + banco → Railway
1. Crie um novo projeto no Railway, adicione um serviço **PostgreSQL**.
2. Adicione um serviço a partir deste repositório (pasta `backend`).
3. Configure as variáveis de ambiente: `DATABASE_URL` (o Railway te dá isso
   automaticamente ao linkar o Postgres), `JWT_SECRET`, `FRONTEND_URL` (a URL
   que a Vercel vai gerar).
4. Rode o `schema.sql` no banco do Railway (dá pra fazer pela aba "Query" do
   próprio Railway, ou via `psql` apontando pro `DATABASE_URL`).
5. Rode `node db/seed.js` uma vez (localmente, apontando o `DATABASE_URL` pro
   banco do Railway) pra criar os usuários iniciais.

### Frontend → Vercel
1. Importe a pasta `frontend` como projeto na Vercel.
2. Configure a variável de ambiente `VITE_API_URL` com a URL pública do
   backend no Railway.
3. Deploy.

## Próximos passos sugeridos
- Trocar as senhas padrão do seed assim que os usuários acessarem pela primeira vez
- Adicionar histórico de vendas (tabela `vendas` separada, em vez de só decrementar quantidade)
- Adicionar gráfico de evolução de estoque/vendas por período
- Permitir que o admin edite/crie usuários pela própria interface
