# Roadmap de Melhorias

> Priorizado por impacto e risco. Cada parte é auto-contida.

---

## Parte 1 — 🔥 Crítico + Segurança

### Bugs que podem quebrar em produção
- [ ] `try/catch` em todas as rotas do Express (`auth.js`, `produtos.js`, `lojas.js`, `cotacao.js`)
- [ ] Middleware global de erro (`app.use(err, req, res, next)`)
- [ ] Validação de `JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL` no startup
- [ ] `CHECK (quantidade >= 0)` no schema
- [ ] `CHECK (valor_usd > 0)` e `CHECK (valor_brl > 0)` no schema

### Segurança
- [ ] `helmet` para headers HTTP
- [ ] `express-rate-limit` no login
- [ ] Frontend trata 401 → limpa contexto e redireciona pra `/login`
- [ ] README não expõe senhas default

---

## Parte 2 — 🧩 Features (Médio)

- [ ] Paginação em `GET /api/produtos` (`LIMIT`/`OFFSET` + total count)
- [ ] Ordenação por `?sort_by=preco&order=desc`
- [ ] Modal customizado no lugar de `confirm()` nativo pra remover
- [ ] Confirmação antes de vender ("Vender X unidades de Y?")
- [ ] Input de quantidade de venda não reseta após vender

---

## Parte 3 — 🎨 UX + Performance

- [ ] Busca server-side (`?busca=`) em vez de filter client-side
- [ ] Dropdown de categoria com loading state
- [ ] Abas com indicador de loading ao trocar
- [ ] Endpoint/logout no backend + botão de logout no frontend
- [ ] Atalhos de teclado (Ctrl+N novo produto, Ctrl+F buscar)
- [ ] `created_at` na tabela `produtos`

---

## Parte 4 — 🧹 Tech Debt

- [ ] Unificar `SelectorCores` (Dashboard.jsx) e seletor de cor do `ModalEditarProduto` (ProdutoCard.jsx)
- [ ] Extrair padrão `salvarFoco/handleEsc/restaurarFoco` pro hook `useFocusTrap`
- [ ] Extrair `ProdutoForm` compartilhado entre criar/editar
- [ ] Pool do DB reusado em `seed.js` e `import_litoral.js`
- [ ] Índice em `reset_tokens.token`
- [ ] Validar email como email nos endpoints de auth
- [ ] Validar `quantidade_vendida` como inteiro
- [ ] `useRef` não usado em `useFocusTrap.js`
