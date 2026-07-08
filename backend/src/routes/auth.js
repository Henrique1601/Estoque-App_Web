import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const usuario = rows[0];

  if (!usuario) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const payload = {
    id: usuario.id,
    nome: usuario.nome,
    role: usuario.role,
    loja_id: usuario.loja_id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  res.json({ token, usuario: payload });
});

export default router;
