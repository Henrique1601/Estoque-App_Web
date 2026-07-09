import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar } from '../middleware/auth.js';
import { obterCotacao } from '../utils/cotacao.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(autenticar);

function lojaPermitida(req, lojaId) {
  return req.usuario.role === 'admin' || Number(req.usuario.loja_id) === Number(lojaId);
}

function valorBrlFinal(produto, cotacao) {
  if (produto.moeda === 'BRL') return Number(produto.valor_brl);
  return Number((produto.valor_usd * cotacao).toFixed(2));
}

router.get('/categorias', asyncHandler(async (req, res) => {
  const { role, loja_id } = req.usuario;
  const params = [];
  let query = 'SELECT DISTINCT categoria FROM produtos WHERE categoria IS NOT NULL';

  if (role !== 'admin') {
    params.push(loja_id);
    query += ` AND loja_id = $${params.length}`;
  }

  const { rows } = await pool.query(query, params);
  res.json(rows.map((r) => r.categoria));
}));

router.get('/', asyncHandler(async (req, res) => {
  const { role, loja_id } = req.usuario;
  const { loja_id: filtroLoja, categoria, busca, sort_by, order, page, limit } = req.query;

  const condicoes = [];
  const params = [];

  if (role === 'admin') {
    if (filtroLoja) {
      params.push(filtroLoja);
      condicoes.push(`loja_id = $${params.length}`);
    }
  } else {
    params.push(loja_id);
    condicoes.push(`loja_id = $${params.length}`);
  }

  if (categoria) {
    params.push(categoria);
    condicoes.push(`categoria = $${params.length}`);
  }

  if (busca) {
    params.push(`%${busca}%`);
    condicoes.push(`nome ILIKE $${params.length}`);
  }

  const where = condicoes.length > 0 ? ' WHERE ' + condicoes.join(' AND ') : '';

  const countResult = await pool.query(`SELECT COUNT(*) FROM produtos${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const colunasOrdenaveis = ['nome', 'valor_brl', 'valor_usd', 'quantidade', 'categoria', 'criado_em', 'atualizado_em'];
  const sortCol = colunasOrdenaveis.includes(sort_by) ? sort_by : 'nome';
  const sortDir = order === 'desc' ? 'DESC' : 'ASC';

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const offset = (pageNum - 1) * limitNum;

  const { rows } = await pool.query(
    `SELECT * FROM produtos${where} ORDER BY ${sortCol} ${sortDir} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limitNum, offset]
  );

  const cotacao = await obterCotacao();

  const produtos = rows.map((p) => ({
    ...p,
    valor_brl: valorBrlFinal(p, cotacao),
  }));

  res.json({ produtos, cotacao, total, page: pageNum, limit: limitNum });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { nome, loja_id, moeda, valor_usd, valor_brl, quantidade, categoria, cor, observacao } = req.body;

  if (!nome || !loja_id || quantidade == null) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, loja_id, quantidade' });
  }
  if (quantidade < 0) {
    return res.status(400).json({ erro: 'quantidade não pode ser negativa' });
  }

  const moedaFinal = moeda === 'BRL' ? 'BRL' : 'USD';
  if (moedaFinal === 'USD' && (valor_usd == null || valor_usd <= 0)) {
    return res.status(400).json({ erro: 'valor_usd deve ser maior que zero' });
  }
  if (moedaFinal === 'BRL' && (valor_brl == null || valor_brl <= 0)) {
    return res.status(400).json({ erro: 'valor_brl deve ser maior que zero' });
  }

  if (!lojaPermitida(req, loja_id)) {
    return res.status(403).json({ erro: 'Você não tem permissão para essa loja' });
  }

  const { rows } = await pool.query(
    `INSERT INTO produtos (nome, loja_id, moeda, valor_usd, valor_brl, quantidade, categoria, cor, observacao)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [nome, loja_id, moedaFinal, valor_usd ?? null, valor_brl ?? null, quantidade, categoria ?? null, cor ?? null, observacao ?? null]
  );

  res.status(201).json(rows[0]);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nome, valor_usd, valor_brl, quantidade, categoria, cor, observacao } = req.body;

  if (quantidade != null && quantidade < 0) {
    return res.status(400).json({ erro: 'quantidade não pode ser negativa' });
  }

  const atual = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
  if (atual.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
  if (!lojaPermitida(req, atual.rows[0].loja_id)) {
    return res.status(403).json({ erro: 'Sem permissão para esse produto' });
  }

  const { rows } = await pool.query(
    `UPDATE produtos SET
       nome = COALESCE(NULLIF($1, ''), nome),
       valor_usd = COALESCE($2, valor_usd),
       valor_brl = COALESCE($3, valor_brl),
       quantidade = COALESCE($4, quantidade),
       categoria = COALESCE($5, categoria),
       cor = COALESCE($6, cor),
       observacao = COALESCE($7, observacao),
       atualizado_em = NOW()
     WHERE id = $8 RETURNING *`,
    [nome, valor_usd, valor_brl, quantidade, categoria, cor, observacao, id]
  );

  res.json(rows[0]);
}));

router.post('/:id/venda', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantidade_vendida } = req.body;

  if (!quantidade_vendida || quantidade_vendida <= 0 || !Number.isInteger(quantidade_vendida)) {
    return res.status(400).json({ erro: 'quantidade_vendida deve ser um inteiro maior que zero' });
  }

  const atual = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
  if (atual.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
  if (!lojaPermitida(req, atual.rows[0].loja_id)) {
    return res.status(403).json({ erro: 'Sem permissão para esse produto' });
  }
  if (atual.rows[0].quantidade < quantidade_vendida) {
    return res.status(400).json({ erro: 'Estoque insuficiente' });
  }

  const { rows } = await pool.query(
    `UPDATE produtos SET quantidade = quantidade - $1, atualizado_em = NOW()
     WHERE id = $2 RETURNING *`,
    [quantidade_vendida, id]
  );

  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const atual = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
  if (atual.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
  if (!lojaPermitida(req, atual.rows[0].loja_id)) {
    return res.status(403).json({ erro: 'Sem permissão para esse produto' });
  }

  await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
  res.status(204).send();
}));

export default router;