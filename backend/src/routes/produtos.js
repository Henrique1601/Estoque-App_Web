import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar } from '../middleware/auth.js';
import { obterCotacao } from '../utils/cotacao.js';

const router = Router();
router.use(autenticar);

function lojaPermitida(req, lojaId) {
  return req.usuario.role === 'admin' || Number(req.usuario.loja_id) === Number(lojaId);
}

function valorBrlFinal(produto, cotacao) {
  if (produto.moeda === 'BRL') return Number(produto.valor_brl);
  return Number((produto.valor_usd * cotacao).toFixed(2));
}

router.get('/categorias', async (req, res) => {
  const { role, loja_id } = req.usuario;
  const params = [];
  let query = 'SELECT DISTINCT categoria FROM produtos WHERE categoria IS NOT NULL';

  if (role !== 'admin') {
    params.push(loja_id);
    query += ` AND loja_id = $${params.length}`;
  }

  const { rows } = await pool.query(query, params);
  res.json(rows.map((r) => r.categoria));
});

router.get('/', async (req, res) => {
  const { role, loja_id } = req.usuario;
  const { loja_id: filtroLoja, categoria } = req.query;

  let query = 'SELECT * FROM produtos';
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

  if (condicoes.length > 0) query += ' WHERE ' + condicoes.join(' AND ');
  query += ' ORDER BY nome';

  const { rows } = await pool.query(query, params);
  const cotacao = await obterCotacao();

  const produtos = rows.map((p) => ({
    ...p,
    valor_brl: valorBrlFinal(p, cotacao),
  }));

  res.json({ produtos, cotacao });
});

router.post('/', async (req, res) => {
  const { nome, loja_id, moeda, valor_usd, valor_brl, quantidade, categoria, cor, observacao } = req.body;

  if (!nome || !loja_id || quantidade == null) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, loja_id, quantidade' });
  }

  const moedaFinal = moeda === 'BRL' ? 'BRL' : 'USD';
  if (moedaFinal === 'USD' && valor_usd == null) {
    return res.status(400).json({ erro: 'valor_usd é obrigatório quando moeda é USD' });
  }
  if (moedaFinal === 'BRL' && valor_brl == null) {
    return res.status(400).json({ erro: 'valor_brl é obrigatório quando moeda é BRL' });
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
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, valor_usd, valor_brl, quantidade, categoria, cor, observacao } = req.body;

  const atual = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
  if (atual.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
  if (!lojaPermitida(req, atual.rows[0].loja_id)) {
    return res.status(403).json({ erro: 'Sem permissão para esse produto' });
  }

  const { rows } = await pool.query(
    `UPDATE produtos SET
       nome = COALESCE($1, nome),
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
});

router.post('/:id/venda', async (req, res) => {
  const { id } = req.params;
  const { quantidade_vendida } = req.body;

  if (!quantidade_vendida || quantidade_vendida <= 0) {
    return res.status(400).json({ erro: 'quantidade_vendida deve ser maior que zero' });
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
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const atual = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
  if (atual.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
  if (!lojaPermitida(req, atual.rows[0].loja_id)) {
    return res.status(403).json({ erro: 'Sem permissão para esse produto' });
  }

  await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
  res.status(204).send();
});

export default router;
