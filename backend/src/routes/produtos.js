import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar } from '../middleware/auth.js';
import { obterCotacao, recalcularPrecos } from '../utils/cotacao.js';
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

// Recalcula valor_brl de todos os produtos USD com a cotação atual
router.post('/recalcular', asyncHandler(async (req, res) => {
  const resultado = await recalcularPrecos();
  res.json(resultado);
}));

// Comparação multi-lojas: produtos com mesmo nome entre lojas diferentes
router.get('/comparar', asyncHandler(async (req, res) => {
  const { role, loja_id } = req.usuario;
  const condicoes = [];
  const params = [];

  if (role !== 'admin') {
    params.push(loja_id);
    condicoes.push(`p.loja_id = $${params.length}`);
  }

  const where = condicoes.length > 0 ? ' WHERE ' + condicoes.join(' AND ') : '';
  const { rows } = await pool.query(
    `SELECT p.id, p.nome, p.loja_id, l.nome AS loja_nome, p.quantidade, p.valor_brl, p.valor_usd, p.moeda, p.cor, p.categoria
     FROM produtos p JOIN lojas l ON l.id = p.loja_id${where} ORDER BY p.nome, l.nome`,
    params
  );

  res.json(rows);
}));

// Exporta produtos como CSV
router.get('/exportar', asyncHandler(async (req, res) => {
  const { role, loja_id } = req.usuario;
  const { loja_id: filtroLoja } = req.query;

  const condicoes = [];
  const params = [];

  if (role === 'admin') {
    if (filtroLoja) { params.push(filtroLoja); condicoes.push(`loja_id = $${params.length}`); }
  } else {
    params.push(loja_id); condicoes.push(`loja_id = $${params.length}`);
  }

  const where = condicoes.length > 0 ? ' WHERE ' + condicoes.join(' AND ') : '';
  const { rows } = await pool.query(`SELECT * FROM produtos${where} ORDER BY nome`, params);

  const cabecalho = 'nome,moeda,valor_usd,valor_brl,quantidade,categoria,cor,codigo_barras,observacao\n';
  const linhas = rows.map((p) => {
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [esc(p.nome), p.moeda, p.valor_usd ?? '', p.valor_brl ?? '', p.quantidade, esc(p.categoria), esc(p.cor), esc(p.codigo_barras), esc(p.observacao)].join(',');
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="produtos.csv"');
  res.send(cabecalho + linhas);
}));

// Importa produtos via JSON array
router.post('/importar', asyncHandler(async (req, res) => {
  const { produtos: lista } = req.body;
  if (!Array.isArray(lista) || lista.length === 0) {
    return res.status(400).json({ erro: 'Envie um array "produtos" com pelo menos 1 item' });
  }

  const criados = [];
  const erros = [];

  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    const idx = i + 1;
    try {
      if (!item.nome || !item.loja_id || item.quantidade == null) {
        erros.push({ linha: idx, motivo: 'Campos obrigatórios: nome, loja_id, quantidade' });
        continue;
      }
      if (item.quantidade < 0) {
        erros.push({ linha: idx, motivo: 'quantidade não pode ser negativa' });
        continue;
      }
      if (!lojaPermitida(req, item.loja_id)) {
        erros.push({ linha: idx, motivo: 'Sem permissão para essa loja' });
        continue;
      }
      const moedaFinal = item.moeda === 'BRL' ? 'BRL' : 'USD';
      if (moedaFinal === 'USD' && (item.valor_usd == null || item.valor_usd <= 0)) {
        erros.push({ linha: idx, motivo: 'valor_usd deve ser maior que zero' });
        continue;
      }
      if (moedaFinal === 'BRL' && (item.valor_brl == null || item.valor_brl <= 0)) {
        erros.push({ linha: idx, motivo: 'valor_brl deve ser maior que zero' });
        continue;
      }

      const { rows } = await pool.query(
        `INSERT INTO produtos (nome, loja_id, moeda, valor_usd, valor_brl, quantidade, categoria, cor, observacao, codigo_barras)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [item.nome, item.loja_id, moedaFinal, item.valor_usd ?? null, item.valor_brl ?? null, item.quantidade, item.categoria ?? null, item.cor ?? null, item.observacao ?? null, item.codigo_barras ?? null]
      );

      await pool.query(
        `INSERT INTO movimentacoes (produto_id, tipo, quantidade, saldo_anterior, saldo_posterior, created_by)
         VALUES ($1, 'entrada', $2, 0, $2, $3)`,
        [rows[0].id, item.quantidade, req.usuario.id]
      );
      await pool.query(
        `INSERT INTO logs (user_id, acao, entidade, entidade_id, detalhes)
         VALUES ($1, 'criar_produto', 'produto', $2, $3)`,
        [req.usuario.id, rows[0].id, JSON.stringify({ nome: item.nome, origem: 'import' })]
      );

      criados.push(rows[0].id);
    } catch (err) {
      erros.push({ linha: idx, motivo: err.message });
    }
  }

  res.json({ criados: criados.length, erros });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { nome, loja_id, moeda, valor_usd, valor_brl, quantidade, categoria, cor, observacao, codigo_barras } = req.body;

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
    `INSERT INTO produtos (nome, loja_id, moeda, valor_usd, valor_brl, quantidade, categoria, cor, observacao, codigo_barras)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [nome, loja_id, moedaFinal, valor_usd ?? null, valor_brl ?? null, quantidade, categoria ?? null, cor ?? null, observacao ?? null, codigo_barras ?? null]
  );

  const qtd = Number(quantidade);
  if (qtd > 0) {
    await pool.query(
      `INSERT INTO movimentacoes (produto_id, tipo, quantidade, saldo_anterior, saldo_posterior, created_by)
       VALUES ($1, 'entrada', $2, 0, $2, $3)`,
      [rows[0].id, qtd, req.usuario.id]
    );
  }
  await pool.query(
    `INSERT INTO logs (user_id, acao, entidade, entidade_id, detalhes)
     VALUES ($1, 'criar_produto', 'produto', $2, $3)`,
    [req.usuario.id, rows[0].id, JSON.stringify({ nome, loja_id, moeda: moedaFinal })]
  );

  res.status(201).json(rows[0]);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nome, valor_usd, valor_brl, quantidade, categoria, cor, observacao, codigo_barras } = req.body;

  if (quantidade != null && quantidade < 0) {
    return res.status(400).json({ erro: 'quantidade não pode ser negativa' });
  }

  const atual = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
  if (atual.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
  if (!lojaPermitida(req, atual.rows[0].loja_id)) {
    return res.status(403).json({ erro: 'Sem permissão para esse produto' });
  }

  const qtdAnterior = Number(atual.rows[0].quantidade);

  const { rows } = await pool.query(
    `UPDATE produtos SET
       nome = COALESCE(NULLIF($1, ''), nome),
       valor_usd = COALESCE($2, valor_usd),
       valor_brl = COALESCE($3, valor_brl),
       quantidade = COALESCE($4, quantidade),
       categoria = COALESCE($5, categoria),
       cor = COALESCE($6, cor),
       observacao = COALESCE($7, observacao),
       codigo_barras = COALESCE($8, codigo_barras),
       atualizado_em = NOW()
     WHERE id = $9 RETURNING *`,
    [nome, valor_usd, valor_brl, quantidade, categoria, cor, observacao, codigo_barras ?? null, id]
  );

  const qtdPos = Number(rows[0].quantidade);
  if (quantidade != null && qtdPos !== qtdAnterior) {
    const diff = Math.abs(qtdPos - qtdAnterior);
    await pool.query(
      `INSERT INTO movimentacoes (produto_id, tipo, quantidade, saldo_anterior, saldo_posterior, created_by, observacao)
       VALUES ($1, 'ajuste', $2, $3, $4, $5, $6)`,
      [id, diff, qtdAnterior, qtdPos, req.usuario.id, `Ajuste: ${qtdAnterior} → ${qtdPos}`]
    );
  }

  await pool.query(
    `INSERT INTO logs (user_id, acao, entidade, entidade_id, detalhes)
     VALUES ($1, 'editar_produto', 'produto', $2, $3)`,
    [req.usuario.id, id, JSON.stringify({ before: atual.rows[0], after: rows[0] })]
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

  const qtdAnterior = Number(atual.rows[0].quantidade);

  const { rows } = await pool.query(
    `UPDATE produtos SET quantidade = quantidade - $1, atualizado_em = NOW()
     WHERE id = $2 RETURNING *`,
    [quantidade_vendida, id]
  );

  await pool.query(
    `INSERT INTO movimentacoes (produto_id, tipo, quantidade, saldo_anterior, saldo_posterior, created_by)
     VALUES ($1, 'saida', $2, $3, $4, $5)`,
    [id, quantidade_vendida, qtdAnterior, rows[0].quantidade, req.usuario.id]
  );
  await pool.query(
    `INSERT INTO logs (user_id, acao, entidade, entidade_id, detalhes)
     VALUES ($1, 'vender_produto', 'produto', $2, $3)`,
    [req.usuario.id, id, JSON.stringify({ quantidade_vendida })]
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

  await pool.query(
    `INSERT INTO logs (user_id, acao, entidade, entidade_id, detalhes)
     VALUES ($1, 'remover_produto', 'produto', $2, $3)`,
    [req.usuario.id, id, JSON.stringify({ nome: atual.rows[0].nome, loja_id: atual.rows[0].loja_id })]
  );

  await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
  res.status(204).send();
}));

export default router;