import { readFileSync } from 'fs';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

export async function migrate() {
  try {
    const sql = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
    await pool.query(sql);
    console.log('Migration: schema.sql executado com sucesso');
  } catch (err) {
    if (err.code === '42P07') {
      console.log('Migration: tabelas já existem, ok');
    } else {
      console.error('Migration: erro ao executar schema.sql', err.message);
    }
  }

  try {
    // Renomeia lojas antigas para os nomes definitivos
    await pool.query(`UPDATE lojas SET nome = 'Central de Estoque' WHERE nome = 'Loja Centro'`);
    await pool.query(`UPDATE lojas SET nome = 'Loja Games' WHERE nome = 'Loja Shopping'`);
    await pool.query(`UPDATE lojas SET nome = 'Loja Litoral' WHERE nome = 'Litoral e Games'`);

    const { rows: lojas } = await pool.query('SELECT id, nome FROM lojas ORDER BY id');
    const usuarios = [
      { nome: 'Admin', email: 'admin@admin.com', senha: 'admin123', role: 'admin', loja_id: null },
    ];
    if (lojas[0]) usuarios.push({ nome: 'Gerente Central', email: 'central@estoque.com', senha: 'central123', role: 'gerente', loja_id: lojas[0].id });
    if (lojas[1]) usuarios.push({ nome: 'Gerente Games', email: 'games@estoque.com', senha: 'games123', role: 'gerente', loja_id: lojas[1].id });
    if (lojas[2]) usuarios.push({ nome: 'Gerente Litoral', email: 'litoral@estoque.com', senha: 'litoral123', role: 'gerente', loja_id: lojas[2].id });

    for (const u of usuarios) {
      const hash = await bcrypt.hash(u.senha, 10);
      await pool.query(
        `INSERT INTO users (nome, email, senha_hash, role, loja_id)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
        [u.nome, u.email, hash, u.role, u.loja_id]
      );
    }
    console.log('Migration: lojas renomeadas e usuários seed criados');
  } catch (err) {
    console.error('Migration: erro ao configurar dados iniciais', err.message);
  }
}
