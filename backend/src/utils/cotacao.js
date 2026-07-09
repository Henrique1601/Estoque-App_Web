import { pool } from '../db.js';

async function cotacaoAtualValida() {
  const { rows } = await pool.query(
    'SELECT valor, atualizado_em FROM cotacao_cache ORDER BY id DESC LIMIT 1'
  );
  if (rows.length === 0) return null;
  const valido = Date.now() - new Date(rows[0].atualizado_em).getTime() < 6 * 60 * 60 * 1000;
  return valido ? { valor: Number(rows[0].valor), atualizado_em: rows[0].atualizado_em } : null;
}

export async function obterCotacao() {
  const cache = await cotacaoAtualValida();
  if (cache) return cache.valor;

  try {
    const resp = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
    const data = await resp.json();
    const valor = Number(data.USDBRL.bid);

    await pool.query('INSERT INTO cotacao_cache (valor) VALUES ($1)', [valor]);

    recalcularPrecos(valor).catch((err) =>
      console.error('Erro no recálculo automático de preços:', err.message)
    );

    return valor;
  } catch (err) {
    console.error('Falha ao buscar cotação, usando último valor salvo:', err.message);
    const { rows } = await pool.query(
      'SELECT valor FROM cotacao_cache ORDER BY id DESC LIMIT 1'
    );
    return rows.length > 0 ? Number(rows[0].valor) : 5.0;
  }
}

export async function recalcularPrecos(cotacao) {
  if (cotacao == null) {
    const { rows } = await pool.query(
      'SELECT valor FROM cotacao_cache ORDER BY id DESC LIMIT 1'
    );
    cotacao = rows.length > 0 ? Number(rows[0].valor) : await obterCotacao();
  }

  const { rowCount } = await pool.query(
    `UPDATE produtos
     SET valor_brl = ROUND(valor_usd * $1, 2), atualizado_em = NOW()
     WHERE moeda = 'USD' AND valor_usd IS NOT NULL`,
    [cotacao]
  );

  console.log(`Recálculo: ${rowCount} produtos atualizados (cotação R$ ${cotacao})`);
  return { produtosAtualizados: rowCount, cotacao };
}

export async function infoCotacao() {
  const { rows } = await pool.query(
    'SELECT valor, atualizado_em FROM cotacao_cache ORDER BY id DESC LIMIT 1'
  );
  if (rows.length === 0) return null;
  return { usd_brl: Number(rows[0].valor), atualizado_em: rows[0].atualizado_em };
}
