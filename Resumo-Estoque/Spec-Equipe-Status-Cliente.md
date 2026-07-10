# Equipe + Status + Cliente

> Adicionar papel `vendedor`, workflow de status (disponivel → reservado → vendido), e dados do cliente no card do produto.

---

## Schema

```sql
ALTER TABLE produtos ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'disponivel'
  CHECK (status IN ('disponivel', 'reservado', 'vendido'));

ALTER TABLE produtos ADD COLUMN cliente_nome VARCHAR(255);
ALTER TABLE produtos ADD COLUMN cliente_telefone VARCHAR(50);
ALTER TABLE produtos ADD COLUMN cliente_observacao TEXT;
```

Migration em `migrate.js` com `ADD COLUMN IF NOT EXISTS` sequential.

---

## Permissões

| Ação                                | admin | gerente | vendedor |
| ----------------------------------- | ----- | ------- | -------- |
| Ver produtos (loja dele)            | ✅     | ✅       | ✅        |
| Ver produtos (outras lojas)         | ✅     | ❌       | ❌        |
| Adicionar produto                   | ✅     | ✅       | ✅        |
| Editar preço/nome/qtd/cor/categoria | ✅     | ✅       | ❌        |
| Mudar status + cliente info         | ✅     | ✅       | ✅        |
| Remover produto                     | ✅     | ✅       | ❌        |
| Ver custo/margem                    | ✅     | ✅       | ❌        |
| Relatórios / exportar / importar    | ✅     | ✅       | ❌        |
| Ver vendidos (admin dashboard)      | ✅     | ❌       | ❌        |

Middleware `autorizar(...papéis)` no backend; `vendedor` recebe response sem `custo_usd`, `custo_brl`, `margem`.

---

## Card do produto

- **Tag de status**: `disponivel` verde, `reservado` laranja, `vendido` vermelho
- `reservado`/`vendido`: exibe `cliente_nome` no card
- Vendedor vê botão "Reservar" (se `disponivel`) e "Vender" (se `reservado`)
- Admin/gerente em `vendido`: só exibição, sem ação

---

## Dashboard Admin — abas

- "Produtos" (todos)
- "Vendidos" (`status = 'vendido'`, ordenado por `updated_at DESC`)
  - Visível apenas para admin

---

## Endpoints

- `POST /api/produtos/:id/status` — body `{ status, cliente_nome?, cliente_telefone?, cliente_observacao? }`
  - `disponivel` → `reservado`: obriga cliente_nome
  - `reservado` → `vendido`: zera quantidade, registra movimentação
  - Só admin/gerente/vendedor podem mudar status (cada um dentro das regras)
- `GET /api/produtos` já filtrado por papel (`loja_id` para gerente/vendedor, sem custo para vendedor)
- Rotas de editar/remover com autorização adicional

---

## Backend

- Middleware `autorizar` no lugar de `autenticar` em rotas específicas
- `vendedor` recebe response filtrado (sem custo/margem)
- Status `reservado` → `vendido`: decrementa quantidade, registra em `movimentacoes` e `logs`
- Status `vendido`: admin pode ver filtrando (`GET /api/produtos?status=vendido`)

---

## Frontend

- `ProdutoCard` ganha tag status + dados cliente condicionais
- Botão "Reservar" abre mini-form inline (nome, telefone, obs) — salva via `api.atualizarStatus`
- Botão "Vender" com `ConfirmModal` — zera qtd, muda status
- Admin Dashboard: nova aba "Vendidos" ao lado de "Produtos"
- Form de criar/editar produto: vendedor não vê campos de custo em nenhum dos dois
- `api.js`: adicionar `atualizarStatus(id, data)` método
- Navbar/AuthContext: `usuario.role` já existe, só usar pra esconder/mostrar
