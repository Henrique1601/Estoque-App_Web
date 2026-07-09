# Spec: Parte E — Relatórios com Gráficos

## Stack
- Chart.js + react-chartjs-2 no frontend
- Backend endpoint `GET /api/produtos/relatorios`

## Backend

Endpoint `GET /api/produtos/relatorios` (protegido por JWT):

```json
{
  "resumo": {
    "totalProdutos": 42,
    "totalItens": 315,
    "valorEstoque": 28450.00,
    "valorCusto": 18200.00,
    "margemMedia": 56.3
  },
  "porCategoria": [
    { "categoria": "Console", "quantidade": 120, "produtos": 8 },
    { "categoria": "Acessório", "quantidade": 80, "produtos": 12 }
  ],
  "porLoja": [
    { "loja": "Loja Games", "itens": 180, "valor": 15200.00 },
    { "loja": "Loja Litoral", "itens": 135, "valor": 13250.00 }
  ],
  "vendas": [
    { "dia": "2026-06-09", "quantidade": 5, "receita": 450.00 },
    { "dia": "2026-06-08", "quantidade": 3, "receita": 270.00 }
  ],
  "topMargens": [
    { "nome": "Produto X", "margem": 120.5, "loja": "Loja Games" }
  ]
}
```

- `vendas`: agregação dos últimos 30 dias de `movimentacoes` (tipo='saida'), com receita estimada via `valor_brl` no momento da venda
- `porCategoria`: GROUP BY categoria em produtos (quantidade total + contagem de produtos distintos)
- `porLoja`: GROUP BY loja_id (soma de valor_brl * quantidade + soma de quantidade)
- `topMargens`: top 10 produtos com maior margem, calculada em tempo real
- `resumo.valorCusto`: soma de (custo_brl * quantidade) ou (custo_usd * cotacao * quantidade)
- `resumo.margemMedia`: média das margens individuais

## Frontend

### Rota
- `/relatorios` — nova página `Relatorios.jsx`
- Link "relatórios" no Navbar

### Layout
- Grid de cards com os resumos numéricos no topo
- Abaixo: gráficos em grid 2x2 (ou 1 coluna em mobile)
- Cada gráfico em um card `.tag-card`
- Tema consistente com o resto (fontes IBM Plex, cores ink/twine/paleta)

### Gráficos
1. **Pizza** — distribuição de itens por categoria
   - Chart.js Doughnut, legenda personalizada com font-mono
2. **Barras** — valor de estoque por loja
   - Chart.js Bar, eixos com font-mono, cor ink
3. **Linha** — vendas nos últimos 30 dias (qtd)
   - Chart.js Line, duas séries: qtd vendida + receita estimada (eixo Y duplo)
4. **Barras horizontais** — top 10 margens
   - Chart.js Bar horizontal, cor verde/twine/stamp conforme margem

### Loading/Error
- Skeleton cards para o grid de resumo
- Skeleton retângulo para os charts
- Mensagem de erro + tentar novamente se falhar

## Não incluso
- Filtros de data (apenas últimos 30 dias fixo)
- Exportação de relatório como PDF/imagem
- Drill-down interativo nos gráficos
