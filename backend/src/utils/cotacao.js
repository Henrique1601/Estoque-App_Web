import { pool } from '../db.js';

// Busca a cotação em cache; se tiver mais de 6 horas, atualiza via AwesomeAPI
export async function obterCotacao() {
  const { rows } = await pool.query(
    'SELECT valor, atualizado_em FROM cotacao_cache ORDER BY id DESC LIMIT 1'
  );

  const cacheValido =
    rows.length > 0 &&
    Date.now() - new Date(rows[0].atualizado_em).getTime() < 6 * 60 * 60 * 1000; // 6 horas

  if (cacheValido) {
    return Number(rows[0].valor);
  }

  try {
    const resp = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
    const data = await resp.json();
    const valor = Number(data.USDBRL.bid);

    await pool.query('INSERT INTO cotacao_cache (valor) VALUES ($1)', [valor]);
    return valor;
  } catch (err) {
    console.error('Falha ao buscar cotação, usando último valor salvo:', err.message);
    return rows.length > 0 ? Number(rows[0].valor) : 5.0; // fallback
  }
}
