import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();
router.use(autenticar);

// Lista as lojas que o usuário pode ver (admin vê todas, gerente só a dele)
router.get('/', async (req, res) => {
  const { role, loja_id } = req.usuario;

  const { rows } =
    role === 'admin'
      ? await pool.query('SELECT * FROM lojas ORDER BY id')
      : await pool.query('SELECT * FROM lojas WHERE id = $1', [loja_id]);

  res.json(rows);
});

export default router;
