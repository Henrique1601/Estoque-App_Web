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

  // Remove constraint UNIQUE existente se foi adicionada antes da migration
  try {
    await pool.query(`ALTER TABLE lojas ADD CONSTRAINT lojas_nome_key UNIQUE (nome)`);
    console.log('Migration: unique constraint adicionada em lojas.nome');
  } catch (_) {}

  // Deduplica lojas: mantém o menor ID de cada nome, remove duplicatas
  try {
    await pool.query(`
      DELETE FROM lojas WHERE id NOT IN (
        SELECT MIN(id) FROM lojas GROUP BY nome
      )
    `);
    console.log('Migration: lojas duplicadas removidas');
  } catch (_) {}

  // Renomeia lojas antigas
  try {
    await pool.query(`UPDATE lojas SET nome = 'Central de Estoque' WHERE nome = 'Loja Centro'`);
    await pool.query(`UPDATE lojas SET nome = 'Loja Games' WHERE nome = 'Loja Shopping'`);
    await pool.query(`UPDATE lojas SET nome = 'Loja Litoral' WHERE nome = 'Litoral e Games'`);
    console.log('Migration: lojas renomeadas');
  } catch (_) {}

  // Cria apenas o admin
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (nome, email, senha_hash, role, loja_id)
       VALUES ('Admin', 'admin@admin.com', $1, 'admin', null)
       ON CONFLICT (email) DO NOTHING`,
      [hash]
    );
    console.log('Migration: usuario admin criado');
  } catch (err) {
    console.error('Migration: erro ao criar admin', err.message);
  }

  // Adiciona coluna cor se não existir
  try {
    await pool.query(`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS cor VARCHAR(50)`);
    console.log('Migration: coluna cor adicionada em produtos');
  } catch (_) {}

  // Adiciona coluna criado_em se não existir
  try {
    await pool.query(`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP DEFAULT NOW()`);
    console.log('Migration: coluna criado_em adicionada em produtos');
  } catch (_) {}
}
