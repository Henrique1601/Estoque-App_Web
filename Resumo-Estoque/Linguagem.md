---
title: Linguagem do Domínio
tags:
  - dominio
  - glossario
---

# Linguagem do Domínio

App web para gerenciar [[Estoque-App|estoque]] de múltiplas lojas. Cada [[#Gerente]] vê apenas a loja que administra; o [[#Admin]] vê todas.

## Lojas

**Loja**: uma loja física real. O sistema controla o estoque de cada loja separadamente.
_Evitar_: Filial, unidade, departamento

**Litoral e Games**: loja real de celulares, games, Apple, Xiaomi e perfumes, importada de planilha existente.
_Evitar_: LG, Litoral

## Produtos

**Produto**: um item no estoque de uma loja, com nome, quantidade, categoria opcional e preço.
_Evitar_: Item, mercadoria, artigo

**Moeda**: regime de precificação do produto — USD (em dólar convertido para real via cotação diária) ou BRL (preço fixo já em reais).
_Evitar_: Tipo de preço, currency

**Cotação**: taxa USD-BRL, buscada da AwesomeAPI e cacheada por 6h na tabela `cotacao_cache`.
_Evitar_: Câmbio, exchange rate, taxa

**Categoria**: agrupamento opcional de produtos (ex: "Apple", "Games", "Perfumes").
_Evitar_: Tag, label, seção

**Estoque Baixo**: condição em que a quantidade de um produto é ≤5 unidades, exibindo alerta visual "REPOR ESTOQUE".
_Evitar_: Alerta, warning, estoque crítico

**Cor**: atributo opcional do produto (ex: "Preto", "Azul Celeste", "Titânio Natural"). Usado especialmente para celulares, onde a cor é um diferenciador importante. O modal de criação/edição oferece uma paleta com ~60 cores de celulares reais + campo para cor personalizada.
_Evitar_: Color, variação

**Modal de criação**: formulário que abre como overlay quando o usuário clica em "+ novo". Na [[Central de Estoque]] exibe um seletor de loja obrigatório; nas lojas individuais a loja é auto-preenchida.
_Evitar_: Inline form, popup, dialog

**Modal de edição**: formulário completo (nome, moeda, valor, quantidade, categoria, cor, observação) que substitui o antigo inline edit que só permitia nome e quantidade.
_Evitar_: Inline edit, quick edit

## Central de Estoque

**Central de Estoque**: aba virtual que consolida produtos de **todas** as lojas físicas. Não é uma loja real no banco — é um filtro "sem loja_id" na query. Serve como visão gerencial do estoque total.
_Evitar_: Todas as lojas, visão geral, loja central

**Loja Física**: loja real no banco de dados (Loja Games, Loja Litoral). Ao selecionar uma aba de loja física, a query filtra por `loja_id`.
_Evitar_: Loja virtual, departamento

## Vendas

**Venda**: registro de saída de produtos que decrementa a quantidade em estoque. Não há histórico persistido de vendas individuais.
_Evitar_: Pedido, transação, saída

## Usuários

**Role**: nível de permissão do usuário — `admin` (acesso global) ou `gerente` (acesso restrito à própria [[#Loja]]).
_Evitar_: Perfil, cargo, tipo, papel

**Admin**: usuário com visão e gerenciamento de todas as lojas.
_Evitar_: Supervisor, dono, master

**Gerente**: usuário que vê apenas os produtos da loja à qual está vinculado (`loja_id`).
_Evitar_: Manager, usuário, operador

## Visual

**Tag Card**: cartão de produto com identidade visual de etiqueta de papel kraft — borda irregular, furo no canto superior esquerdo, leve rotação.
_Evitar_: Card, cartão, sticker

**Selo**: carimbo vermelho "REPOR ESTOQUE" aplicado sobre o card quando o estoque está baixo.
_Evitar_: Badge, stamp, etiqueta
