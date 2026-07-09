# Roadmap de Melhorias

> Priorizado por impacto e risco. Cada parte é auto-contida.

---

## Parte 1 — 🔥 Crítico + Segurança

### Bugs que podem quebrar em produção
- [x] `try/catch` em todas as rotas do Express (`auth.js`, `produtos.js`, `lojas.js`, `cotacao.js`)
- [x] Middleware global de erro (`app.use(err, req, res, next)`)
- [x] Validação de `JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL` no startup
- [x] `CHECK (quantidade >= 0)` no schema
- [x] `CHECK (valor_usd > 0)` e `CHECK (valor_brl > 0)` no schema

### Segurança
- [x] `helmet` para headers HTTP
- [x] `express-rate-limit` no login
- [x] Frontend trata 401 → limpa contexto e redireciona pra `/login`
- [x] README não expõe senhas default

---

## Parte 2 — 🧩 Features (Médio)

- [x] Paginação em `GET /api/produtos` (`LIMIT`/`OFFSET` + total count)
- [x] Ordenação por `?sort_by=preco&order=desc`
- [x] Modal customizado no lugar de `confirm()` nativo pra remover
- [x] Confirmação antes de vender ("Vender X unidades de Y?")
- [x] Input de quantidade de venda não reseta após vender

---

## Parte 3 — 🎨 UX + Performance

- [x] Busca server-side (`?busca=`) em vez de filter client-side
- [x] Dropdown de categoria com loading state
- [x] Abas com indicador de loading ao trocar
- [x] Endpoint/logout no backend + botão de logout no frontend
- [x] Atalhos de teclado (Ctrl+N novo produto, Ctrl+F buscar)
- [x] `created_at` na tabela `produtos`

---

## Parte 4 — 🧹 Tech Debt

- [x] Unificar `SelectorCores` (Dashboard.jsx) e seletor de cor do `ModalEditarProduto` (ProdutoCard.jsx)
- [x] Extrair padrão `salvarFoco/handleEsc/restaurarFoco` pro hook `useFocusTrap`
- [ ] Extrair `ProdutoForm` compartilhado entre criar/editar
- [x] Pool do DB reusado em `seed.js` e `import_litoral.js` (arquivos removidos)
- [ ] Índice em `reset_tokens.token`
- [ ] Validar email como email nos endpoints de auth
- [ ] Validar `quantidade_vendida` como inteiro
- [x] `useRef` não usado em `useFocusTrap.js`

---

## Parte A — Fundação (movimentações + logs)

- [x] Tabela `movimentacoes` (entrada/saida/ajuste com saldo_anterior/posterior)
- [x] Tabela `logs` (ação JSONB)
- [x] Rotas criam/editar/vender/remover registram movimentação
- [x] Rotas chamam `inserirLog()` para auditoria
- [x] `Spec-ParteA-Fundacao.md`

---

## Parte B — Dados (CSV + código de barras)

- [x] Coluna `codigo_barras` em `produtos`
- [x] `GET /exportar` → CSV dos produtos
- [x] `POST /importar` → CSV → backend com validação
- [x] Botão download CSV + input file import no frontend
- [x] `codigo_barras` nos modais criar/editar

---

## Parte C — Preço de custo + margem

- [x] Colunas `custo_usd` / `custo_brl` (opcionais, CHECK > 0)
- [x] `calcularMargem()` em tempo real nas responses
- [x] Campos de custo nos modais criar/editar
- [x] Exibição colorida da margem no card (verde ≥30%, caramelo ≥10%, stamp <10%)
- [x] Margem no CSV export e import
- [x] `Spec-ParteC-Margem.md`

---

## Parte D — Modo escuro + estoque baixo + comparativo

- [x] Dark mode via CSS variables + Tailwind `darkMode: 'class'`
- [x] `ThemeContext.jsx` com persistência localStorage + fallback `prefers-color-scheme`
- [x] Notificação de estoque baixo (toast) no primeiro load
- [x] `GET /api/produtos/comparar` — pivot table multi-lojas
- [x] `CompararLojasModal` no Dashboard

---

## Parte E — Relatórios com gráficos

- [x] Chart.js + react-chartjs-2
- [x] `GET /api/produtos/relatorios` — resumo, porCategoria, porLoja, vendas 30d, topMargens
- [x] `Relatorios.jsx` com 5 cards + 4 gráficos (Doughnut, Bar, Line dual-axis, horizontal Bar)
- [x] Link "relatórios" no Navbar
- [x] `Spec-ParteE-Relatorios.md`

---

## Parte F — Perfil + trocar senha

- [x] `PUT /api/auth/perfil` — alterar nome
- [x] `PUT /api/auth/trocar-senha` — verifica atual, hash nova
- [x] `Perfil.jsx` com formulários de nome e senha
- [x] Rota `/perfil` + link no Navbar
- [x] `setUsuario` exposto no AuthContext para atualizar nome em tempo real
