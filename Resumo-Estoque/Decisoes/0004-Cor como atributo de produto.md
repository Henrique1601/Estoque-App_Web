---
title: "0004 — Cor como atributo de produto"
tags:
  - decisao
  - schema
---

# 0004 — Cor como atributo de produto

**Data**: 2026-07-09

**Status**: Aceito

## Contexto

Produtos — especialmente celulares — têm a cor como um atributo relevante para identificação e precificação. Um mesmo modelo de celular pode ter valores diferentes dependendo da cor (ex: branco mais barato que preto). A ausência de cor no cadastro obrigava o usuário a incluir a cor no nome do produto (ex: "iPhone 16 Pro Preto"), o que poluía a busca e categorização.

## Decisão

Adicionar coluna opcional `cor VARCHAR(50)` na tabela `produtos`.

- É um campo textual livre, não uma chave estrangeira para tabela de cores
- O frontend oferece uma paleta de ~60 cores extraídas de catálogos reais de iPhone, Samsung, Xiaomi e Google (ex: Titânio Natural, Azul Sierra, Verde Alpino, Meia-Noite)
- O usuário pode digitar uma cor personalizada se a desejada não estiver na paleta
- A cor aparece como badge no canto do [[../Linguagem#Tag Card|tag card]]

## Consequências

- Schema precisa de migration adicionando coluna (feito em `migrate.js`)
- Backend routes POST e PUT já aceitam o campo via `COALESCE`
- Frontend modal de criação e edição incluem seletor de cores com busca + paleta
- Produtos existentes ficam com `cor = NULL` (sem badge)
- Futuro: possível autocomplete com sugestões baseadas em modelos já cadastrados

## Alternativas consideradas

- **Tabela separada de cores**: rejeitado por ser overengineering para um campo opcional com ~60 valores
- **Enum PostgreSQL**: rejeitado porque novas cores surgem todo ano; alterar enum requer migration pesada
- **Cor no nome do produto**: era o comportamento anterior, rejeitado por prejudicar busca
