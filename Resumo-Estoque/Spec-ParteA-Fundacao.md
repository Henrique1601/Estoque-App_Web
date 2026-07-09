# Spec: Parte A — Fundação (Histórico + Logs)

## Tabelas

### `movimentacoes`
Registra toda alteração quantitativa no estoque de um produto.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL PK | |
| produto_id | INTEGER FK → produtos | |
| tipo | VARCHAR(20) | 'entrada' | 'saida' | 'ajuste' |
| quantidade | INTEGER | qtde movimentada (sempre positiva) |
| saldo_anterior | INTEGER | qtde antes da movimentação |
| saldo_posterior | INTEGER | qtde depois da movimentação |
| observacao | TEXT | opcional |
| created_by | INTEGER FK → users | |
| criado_em | TIMESTAMP | DEFAULT NOW() |

### `logs`
Registra ações de usuário no sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | SERIAL PK | |
| user_id | INTEGER FK → users | |
| acao | VARCHAR(50) | 'criar_produto', 'editar_produto', 'remover_produto', 'vender_produto', 'login', 'logout' |
| entidade | VARCHAR(50) | 'produto', 'usuario', 'loja' |
| entidade_id | INTEGER | ID da entidade afetada |
| detalhes | JSONB | informações contextuais (before/after, valores, etc) |
| criado_em | TIMESTAMP | DEFAULT NOW() |

## Pontos de integração

### Rotas que ganham INSERT em `movimentacoes`
- `POST /api/produtos` → INSERT movimentacoes (tipo='entrada', quantidade = qtd inicial)
- `POST /api/produtos/:id/venda` → INSERT movimentacoes (tipo='saida')
- `PUT /api/produtos/:id` → SE quantidade mudou, INSERT movimentacoes (tipo='ajuste')

### Rotas que ganham INSERT em `logs`
- `POST /api/produtos` → log criar_produto
- `PUT /api/produtos/:id` → log editar_produto
- `DELETE /api/produtos/:id` → log remover_produto
- `POST /api/produtos/:id/venda` → log vender_produto
- `POST /api/auth/login` → log login
- `POST /api/auth/logout` → log logout

## Migração
- `migrate.js` cria as tabelas com `IF NOT EXISTS`
- schema.sql atualizado com as definições

## Não incluso (primeira iteração)
- Frontend (histórico no ProdutoCard, página de logs)
- Exportação de relatórios
