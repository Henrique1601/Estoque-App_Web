---
title: "0002: Precificação USD com Conversão e BRL Fixo"
tags:
  - decisao
  - precificacao
aliases:
  - Precificação dupla
---

# 0002: Precificação USD com Conversão e BRL Fixo

> [!info] Contexto
> A [[../Linguagem#Litoral e Games|Litoral e Games]] vende produtos importados (Apple, Xiaomi) cujo preço varia com o dólar. Produtos nacionais têm preço fixo em real.

**Decisão**: Suportar duas [[../Linguagem#Moeda|moedas]]:
- **USD** — valor em dólar convertido para BRL via cotação diária
- **BRL** — preço fixo já em reais

**Cotação**: buscada da AwesomeAPI (pública, gratuita, sem chave) e cacheada por 6h na tabela `cotacao_cache`. Se a API falha, usa o último valor salvo. Se não há cache, fallback para 5.0.

**Alternativa rejeitada**: usar sempre BRL fixo e atualizar manualmente — a conversão automática evita retrabalho de reajuste manual nos importados.
