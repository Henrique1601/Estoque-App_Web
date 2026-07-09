---
title: "0003: Migration Automática no Startup"
tags:
  - decisao
  - banco
aliases:
  - Auto migration
---

# 0003: Migration Automática no Startup

> [!info] Contexto
> O banco PostgreSQL no Railway é recriado do zero em ambientes novos. Precisávamos garantir que as tabelas existam sem ferramentas de migração complexas.

**Decisão**: O schema vive em `backend/db/schema.sql` e é executado automaticamente toda vez que o servidor sobe (`migrate()` em `src/migrate.js`). Usa `CREATE TABLE IF NOT EXISTS` e `ON CONFLICT DO NOTHING` para ser idempotente.

**Por quê**: elimina ferramentas de migração (Alecrim, Flyway). Para 4 tabelas, um único SQL que roda no startup é mais simples e suficiente.

**Risco conhecido**: mudanças destrutivas (ALTER TABLE DROP COLUMN) não são gerenciadas. O schema só cresce — expandido incrementalmente com `IF NOT EXISTS`.
