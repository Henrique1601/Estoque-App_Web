import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

router.get('/', autenticar, asyncHandler(async (req, res) => {
  const { tipo, loja_id, busca, data_inicio, data_fim, page = '1', limit = '30' } = req.query;
  const pagina = Math.max(1, Number(page));
  const limite = Math.min(100, Math.max(1, Number(limit)));
  const offset = (pagina - 1) * limite;

  const condicoes = [];
  const params = [];

  if (tipo) {
    params.push(tipo);
    condicoes.push(`m.tipo = $${params.length}`);
  }

  if (loja_id) {
    params.push(Number(loja_id));
    condicoes.push(`p.loja_id = $${params.length}`);
  }

  if (data_inicio) {
    params.push(data_inicio);
    condicoes.push(`m.criado_em >= $${params.length}`);
  }

  if (data_fim) {
    params.push(data_fim);
    condicoes.push(`m.criado_em <= $${params.length}::timestamp + interval '1 day'`);
  }

  if (busca) {
    params.push(`%${busca}%`);
    condicoes.push(`p.nome ILIKE $${params.length}`);
  }

  // Gerente só vê movimentações da loja dele
  if (req.usuario.role === 'gerente' && req.usuario.loja_id) {
    params.push(req.usuario.loja_id);
    condicoes.push(`p.loja_id = $${params.length}`);
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM movimentacoes m JOIN produtos p ON p.id = m.produto_id ${where}`,
    params
  );
  const total = Number(countResult.rows[0].count);

  const { rows } = await pool.query(
    `SELECT m.*, p.nome AS produto_nome, p.loja_id, l.nome AS loja_nome, u.nome AS usuario_nome
     FROM movimentacoes m
     JOIN produtos p ON p.id = m.produto_id
     JOIN lojas l ON l.id = p.loja_id
     LEFT JOIN users u ON u.id = m.created_by
     ${where}
     ORDER BY m.criado_em DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limite, offset]
  );

  res.json({ movimentacoes: rows, total, page: pagina, limit: limite });
}));

export default router;