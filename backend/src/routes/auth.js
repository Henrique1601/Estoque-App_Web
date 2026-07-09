import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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

router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
  }

  const existente = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existente.rows[0]) {
    return res.status(409).json({ erro: 'Email já cadastrado' });
  }

  const hash = await bcrypt.hash(senha, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (nome, email, senha_hash, role)
     VALUES ($1, $2, $3, 'gerente') RETURNING id, nome, email, role`,
    [nome, email, hash]
  );

  const usuario = rows[0];
  const payload = { id: usuario.id, nome: usuario.nome, role: usuario.role, loja_id: null };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  res.status(201).json({ token, usuario: payload });
});

router.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ erro: 'Email é obrigatório' });
  }

  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (!rows[0]) {
    return res.status(404).json({ erro: 'Email não encontrado' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  await pool.query(
    `INSERT INTO reset_tokens (user_id, token) VALUES ($1, $2)`,
    [rows[0].id, token]
  );

  res.json({ mensagem: 'Token de redefinição gerado', token });
});

router.post('/redefinir-senha', async (req, res) => {
  const { token, senha } = req.body;
  if (!token || !senha) {
    return res.status(400).json({ erro: 'Token e nova senha são obrigatórios' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
  }

  const { rows } = await pool.query(
    `SELECT user_id FROM reset_tokens
     WHERE token = $1 AND expira_em > NOW()`,
    [token]
  );

  if (!rows[0]) {
    return res.status(400).json({ erro: 'Token inválido ou expirado' });
  }

  const hash = await bcrypt.hash(senha, 10);
  await pool.query('UPDATE users SET senha_hash = $1 WHERE id = $2', [hash, rows[0].user_id]);
  await pool.query('DELETE FROM reset_tokens WHERE token = $1', [token]);

  res.json({ mensagem: 'Senha redefinida com sucesso' });
});

export default router;
