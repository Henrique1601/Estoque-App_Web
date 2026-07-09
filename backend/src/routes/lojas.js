import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(autenticar);

router.get('/', asyncHandler(async (req, res) => {
  const { role, loja_id } = req.usuario;

  const { rows } =
    role === 'admin'
      ? await pool.query('SELECT * FROM lojas ORDER BY id')
      : await pool.query('SELECT * FROM lojas WHERE id = $1', [loja_id]);

  res.json(rows);
}));

export default router;