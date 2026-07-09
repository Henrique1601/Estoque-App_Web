# Spec: Parte C — Preço de Custo + Margem de Lucro

## Schema

Adicionar duas colunas opcionais em `produtos`:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| custo_usd | NUMERIC(10,2) | custo em dólar (se moeda=USD) |
| custo_brl | NUMERIC(10,2) | custo em reais (se moeda=BRL) |

CHECK constraints: `custo_usd IS NULL OR custo_usd > 0`, `custo_brl IS NULL OR custo_brl > 0`.

Ambas opcionais — se NULL, margem não é exibida.

## Cálculo (backend, em tempo real)

Margem percentual calculada na resposta da API junto com `valor_brl`:

- Se moeda=USD e custo_usd preenchido:  
  `margem = ((valor_usd - custo_usd) / custo_usd * 100).toFixed(1)`
- Se moeda=BRL e custo_brl preenchido:  
  `margem = ((valor_brl - custo_brl) / custo_brl * 100).toFixed(1)`
- Se custo não preenchido: `margem = null`

Na Central (cross-store), o custo_usd também é convertido via cotação para consistência, mas o cálculo de margem usa a moeda original do produto.

Incluído nos seguintes endpoints:
- `GET /api/produtos` (lista paginada)
- `POST /api/produtos` (create response)
- `PUT /api/produtos/:id` (update response)
- `POST /api/produtos/:id/venda` (venda response)
- `GET /api/produtos/comparar`
- `GET /api/produtos/exportar` (colunas adicionais)
- `POST /api/produtos/importar` (parse custo_usd / custo_brl)

## Frontend

### Formulários (criar / editar)
- Abaixo do campo de valor (venda), adicionar campo `custo (usd)` ou `custo (brl)` conforme moeda selecionada
- Opcional, placeholder "opcional"

### Card do produto (ProdutoCard.jsx)
- Abaixo do preço de venda, exibir `Margem: X%` se custo preenchido
- Cores:
  - Verde (`#2D6A4F`) se margem ≥ 30%
  - Twine se margem entre 10% e 30%
  - Stamp se margem < 10%

### Export/Import CSV
- Colunas adicionais: `custo_usd`, `custo_brl`
- Import parseia e valida

## Migração

```sql
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS custo_usd NUMERIC(10,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS custo_brl NUMERIC(10,2);
```

CHECK constraints adicionadas no schema.sql.
