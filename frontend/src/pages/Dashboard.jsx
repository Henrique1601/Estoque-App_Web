import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import ProdutoCard from '../components/ProdutoCard.jsx';

const PRODUTO_VAZIO = { nome: '', moeda: 'USD', valor_usd: '', valor_brl: '', quantidade: '', categoria: '' };

export default function Dashboard() {
  const { usuario } = useAuth();
  const [lojas, setLojas] = useState([]);
  const [lojaSelecionada, setLojaSelecionada] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [cotacao, setCotacao] = useState(null);
  const [novoProduto, setNovoProduto] = useState(PRODUTO_VAZIO);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.listarLojas().then((rows) => {
      setLojas(rows);
      if (rows.length > 0) setLojaSelecionada(rows[0].id);
    });
    api.listarCategorias().then(setCategorias);
  }, []);

  async function carregarProdutos() {
    if (usuario.role !== 'admin' && !lojaSelecionada) return;
    const { produtos, cotacao } = await api.listarProdutos(
      usuario.role === 'admin' ? lojaSelecionada : undefined,
      categoriaSelecionada || undefined
    );
    setProdutos(produtos);
    setCotacao(cotacao);
  }

  useEffect(() => {
    carregarProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lojaSelecionada, categoriaSelecionada]);

  async function handleCriarProduto(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.criarProduto({
        nome: novoProduto.nome,
        moeda: novoProduto.moeda,
        valor_usd: novoProduto.moeda === 'USD' ? Number(novoProduto.valor_usd) : undefined,
        valor_brl: novoProduto.moeda === 'BRL' ? Number(novoProduto.valor_brl) : undefined,
        quantidade: Number(novoProduto.quantidade),
        categoria: novoProduto.categoria || undefined,
        loja_id: usuario.role === 'admin' ? lojaSelecionada : usuario.loja_id,
      });
      setNovoProduto(PRODUTO_VAZIO);
      carregarProdutos();
    } catch (err) {
      setErro(err.message);
    }
  }

  const valorTotalEstoque = produtos.reduce(
    (soma, p) => soma + p.valor_brl * p.quantidade,
    0
  );

  return (
    <div className="min-h-screen bg-kraft">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {usuario.role === 'admin' && lojas.length > 0 && (
          <div className="flex gap-1">
            {lojas.map((loja) => (
              <button
                key={loja.id}
                onClick={() => setLojaSelecionada(loja.id)}
                className={`folder-tab px-4 py-2 text-sm font-medium font-mono ${
                  lojaSelecionada === loja.id
                    ? 'bg-paper text-ink'
                    : 'bg-kraft-dark/40 text-ink/60'
                }`}
              >
                {loja.nome}
              </button>
            ))}
          </div>
        )}

        <div className="bg-paper rounded-md border border-ink/15 p-5 font-mono flex justify-between items-end">
          <div>
            <p className="text-xs uppercase tracking-wide text-twine">Total em estoque</p>
            <p className="text-3xl font-semibold text-ink leading-tight">
              R$ {valorTotalEstoque.toFixed(2)}
            </p>
          </div>
          {cotacao && (
            <div className="text-right text-xs text-twine">
              <p>cotação usd/brl</p>
              <p className="text-sm text-ink font-medium">R$ {cotacao.toFixed(4)}</p>
            </div>
          )}
        </div>

        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaSelecionada('')}
              className={`text-xs font-mono px-3 py-1 rounded-full border ${
                categoriaSelecionada === '' ? 'bg-ink text-paper border-ink' : 'border-ink/25 text-ink/70'
              }`}
            >
              todas
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSelecionada(cat)}
                className={`text-xs font-mono px-3 py-1 rounded-full border ${
                  categoriaSelecionada === cat ? 'bg-ink text-paper border-ink' : 'border-ink/25 text-ink/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleCriarProduto}
          className="bg-paper rounded-md border border-ink/15 p-4 flex flex-wrap gap-2 items-end"
        >
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-twine mb-1 font-mono">produto</label>
            <input
              required
              value={novoProduto.nome}
              onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper"
            />
          </div>

          <div className="w-20">
            <label className="block text-xs text-twine mb-1 font-mono">moeda</label>
            <select
              value={novoProduto.moeda}
              onChange={(e) => setNovoProduto({ ...novoProduto, moeda: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-2 py-2 text-sm font-mono bg-paper"
            >
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>
          </div>

          {novoProduto.moeda === 'USD' ? (
            <div className="w-28">
              <label className="block text-xs text-twine mb-1 font-mono">valor (usd)</label>
              <input
                required
                type="number"
                step="0.01"
                value={novoProduto.valor_usd}
                onChange={(e) => setNovoProduto({ ...novoProduto, valor_usd: e.target.value })}
                className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono bg-paper"
              />
            </div>
          ) : (
            <div className="w-28">
              <label className="block text-xs text-twine mb-1 font-mono">valor (brl)</label>
              <input
                required
                type="number"
                step="0.01"
                value={novoProduto.valor_brl}
                onChange={(e) => setNovoProduto({ ...novoProduto, valor_brl: e.target.value })}
                className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono bg-paper"
              />
            </div>
          )}

          <div className="w-24">
            <label className="block text-xs text-twine mb-1 font-mono">qtd</label>
            <input
              required
              type="number"
              value={novoProduto.quantidade}
              onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono bg-paper"
            />
          </div>

          <div className="w-28">
            <label className="block text-xs text-twine mb-1 font-mono">categoria</label>
            <input
              value={novoProduto.categoria}
              onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
              placeholder="opcional"
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper"
            />
          </div>

          <button
            type="submit"
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/85"
          >
            Adicionar
          </button>
        </form>
        {erro && <p className="text-sm text-stamp">{erro}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {produtos.map((produto) => (
            <ProdutoCard key={produto.id} produto={produto} onAtualizar={carregarProdutos} />
          ))}
          {produtos.length === 0 && (
            <p className="text-ink/50 text-sm col-span-2 text-center py-8 font-mono">
              nenhum produto cadastrado ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
