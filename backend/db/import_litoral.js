// Importa o estoque da planilha LITORAL_E_GAMES.xlsx pro banco de dados.
// Uso: node db/import_litoral.js /caminho/para/LITORAL_E_GAMES.xlsx
//
// Regras aplicadas (definidas com o usuário):
// - Valores entram como BRL direto (sem conversão de cotação)
// - Abas APPLE, XIAOMI, PERFUMES não têm quantidade na planilha -> assume 1
// - Aba UPGRADE é ignorada (não é estoque, é tabela de preço de troca)
// - Linhas sem custo preenchido (produto "zerado", fora de estoque) são puladas
// - Linha "TOTAL" e linhas em branco no fim de cada aba são ignoradas

import 'dotenv/config';
import pkg from 'pg';
import xlsx from 'xlsx';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ARQUIVO = process.argv[2];
if (!ARQUIVO) {
  console.error('Uso: node db/import_litoral.js /caminho/para/LITORAL_E_GAMES.xlsx');
  process.exit(1);
}

const NOME_LOJA = 'Litoral e Games';

// categoria => nome da aba na planilha
const ABAS = {
  Plan1: 'Geral',
  APPLE: 'Apple',
  GAMES: 'Games',
  'XIAOMI ': 'Xiaomi',
  'PERFUMES ': 'Perfumes',
  // UPGRADE fica de fora de propósito
};

function extrairProdutosPlan1(sheet) {
  // colunas: PRODUTOS | CUSTO | UNIDADE | TOTAL | OBSERVAÇÃO
  const linhas = xlsx.utils.sheet_to_json(sheet, { header: 1, range: 1 });
  const produtos = [];
  for (const linha of linhas) {
    const [nome, custo, unidade, , observacao] = linha;
    if (!nome || typeof nome !== 'string') continue;
    if (nome.trim().toUpperCase() === 'TOTAL') continue;
    if (custo == null || custo === '' || typeof custo !== 'number') continue; // sem preço = fora de estoque
    produtos.push({
      nome: nome.trim(),
      valor_brl: Number(custo),
      quantidade: Number(unidade) || 0,
      observacao: observacao ? String(observacao).trim() : null,
    });
  }
  return produtos;
}

function extrairProdutosSimples(sheet, quantidadePadrao) {
  // colunas: NOME | (vazio) | (vazio) | (vazio) | PRECO  [ | (vazio) | QUANTIDADE ]
  const linhas = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const produtos = [];
  for (const linha of linhas) {
    const nome = linha[0];
    const preco = linha[4];
    const quantidade = linha[6];
    if (!nome || typeof nome !== 'string') continue;
    if (preco == null || preco === '' || typeof preco !== 'number') continue;
    produtos.push({
      nome: nome.trim(),
      valor_brl: Number(preco),
      quantidade: quantidade != null && quantidade !== '' ? Number(quantidade) : quantidadePadrao,
      observacao: null,
    });
  }
  return produtos;
}

async function main() {
  const workbook = xlsx.readFile(ARQUIVO);

  const lojaResult = await pool.query(
    `INSERT INTO lojas (nome) VALUES ($1)
     ON CONFLICT DO NOTHING RETURNING id`,
    [NOME_LOJA]
  );
  let lojaId = lojaResult.rows[0]?.id;
  if (!lojaId) {
    const existente = await pool.query('SELECT id FROM lojas WHERE nome = $1', [NOME_LOJA]);
    lojaId = existente.rows[0].id;
  }

  let totalImportado = 0;

  for (const [nomeAba, categoria] of Object.entries(ABAS)) {
    const sheet = workbook.Sheets[nomeAba];
    if (!sheet) {
      console.warn(`Aba "${nomeAba}" não encontrada, pulando.`);
      continue;
    }

    const produtos =
      nomeAba === 'Plan1'
        ? extrairProdutosPlan1(sheet)
        : extrairProdutosSimples(sheet, categoria === 'Games' ? 1 : 1);

    for (const p of produtos) {
      await pool.query(
        `INSERT INTO produtos (nome, loja_id, moeda, valor_brl, quantidade, categoria, observacao)
         VALUES ($1, $2, 'BRL', $3, $4, $5, $6)`,
        [p.nome, lojaId, p.valor_brl, p.quantidade, categoria, p.observacao]
      );
      totalImportado++;
    }

    console.log(`Aba "${nomeAba}" (${categoria}): ${produtos.length} produtos importados`);
  }

  console.log(`\nTotal: ${totalImportado} produtos importados na loja "${NOME_LOJA}".`);
  await pool.end();
}

main().catch((err) => {
  console.error('Erro na importação:', err);
  process.exit(1);
});
