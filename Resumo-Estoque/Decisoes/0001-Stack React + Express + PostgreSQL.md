---
title: "0001: Stack React + Express + PostgreSQL"
tags:
  - decisao
  - arquitetura
aliases:
  - Stack
---

# 0001: Stack React + Express + PostgreSQL

> [!info] Contexto
> Precisávamos de uma stack simples e produtiva para um app de controle de estoque com frontend web, backend API e banco de dados relacional.

**Decisão**: React (Vite + Tailwind) no frontend, Express no backend, PostgreSQL puro (sem ORM). Deploy: Vercel + Railway.

**Por quê**:
- React + Vite é o padrão mais produtivo para SPAs modernas
- Express é o framework Node mais conhecido, sem abstrações extras
- PostgreSQL é relacional o suficiente para o domínio (lojas, produtos, vendas) e roda de graça no Railway
- SQL puro em vez de Prisma/TypeORM porque o schema tem 4 tabelas — ORM não se justifica
- JWT sem sessões porque o app não precisa de refresh tokens, invalidação ou SSO
