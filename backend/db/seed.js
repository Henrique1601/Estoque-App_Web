// Script para criar usuários iniciais (admin + gerentes das 2 lojas)
// Uso: node db/seed.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const lojas = await pool.query('SELECT id, nome FROM lojas ORDER BY id');
  if (lojas.rows.length < 2) {
    console.error('Rode antes o schema.sql para criar as lojas.');
    process.exit(1);
  }

  const [lojaCentro, lojaShopping] = lojas.rows;

  const usuarios = [
    { nome: 'Admin', email: 'admin@estoque.com', senha: 'admin123', role: 'admin', loja_id: null },
    { nome: 'Gerente Centro', email: 'centro@estoque.com', senha: 'centro123', role: 'gerente', loja_id: lojaCentro.id },
    { nome: 'Gerente Shopping', email: 'shopping@estoque.com', senha: 'shopping123', role: 'gerente', loja_id: lojaShopping.id },
  ];

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.senha, 10);
    await pool.query(
      `INSERT INTO users (nome, email, senha_hash, role, loja_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [u.nome, u.email, hash, u.role, u.loja_id]
    );
    console.log(`Usuário criado: ${u.email} / senha: ${u.senha}`);
  }

  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
