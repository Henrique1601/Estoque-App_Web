import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Navbar from '../components/Navbar.jsx';
import ProdutoCard from '../components/ProdutoCard.jsx';

const PRODUTO_VAZIO = { nome: '', moeda: 'USD', valor_usd: '', valor_brl: '', quantidade: '', categoria: '' };

function SkeletonCard() {
  return (
    <div className="tag-card p-4 pl-6" style={{ transform: 'none' }}>
      <span className="tag-hole" aria-hidden="true" />
      <div className="skeleton h-5 w-3/4 mb-3" />
      <div className="skeleton h-8 w-1/2 mb-2" />
      <div className="skeleton h-4 w-1/3 mb-4" />
      <div className="skeleton h-9 w-full mt-3" />
    </div>
  );
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const addToast = useToast();
  const [lojas, setLojas] = useState([]);
  const [lojaSelecionada, setLojaSelecionada] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [busca, setBusca] = useState('');
  const [cotacao, setCotacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [novoProduto, setNovoProduto] = useState(PRODUTO_VAZIO);
  const [erro, setErro] = useState('');
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    Promise.all([
      api.listarLojas().then((rows) => {
        setLojas(rows);
        if (rows.length > 0 && !lojaSelecionada) setLojaSelecionada(rows[0].id);
      }),
      api.listarCategorias().then(setCategorias),
    ]);
  }, []);

  async function carregarProdutos() {
    if (usuario.role !== 'admin' && !lojaSelecionada) return;
    setCarregando(true);
    try {
      const data = await api.listarProdutos(
        usuario.role === 'admin' ? lojaSelecionada : undefined,
        categoriaSelecionada || undefined
      );
      setProdutos(data.produtos || data);
      setCotacao(data.cotacao || null);
    } catch (err) {
      addToast('Erro ao carregar produtos', 'error');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lojaSelecionada, categoriaSelecionada]);

  async function handleCriarProduto(e) {
    e.preventDefault();
    setErro('');
    setCriando(true);
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
      addToast('Produto adicionado', 'success');
      carregarProdutos();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCriando(false);
    }
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const valorTotalEstoque = produtosFiltrados.reduce(
    (soma, p) => soma + Number(p.valor_brl) * Number(p.quantidade),
    0
  );
  const totalProdutos = produtosFiltrados.length;
  const totalItens = produtosFiltrados.reduce((s, p) => s + Number(p.quantidade), 0);
  const estoqueBaixoCount = produtosFiltrados.filter((p) => p.quantidade <= 5).length;

  const lojaAtual = lojas.find((l) => l.id === lojaSelecionada);

  return (
    <div className="min-h-[100dvh] bg-kraft">
      <Navbar />

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {usuario.role === 'admin' && lojas.length > 0 && (
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {lojas.map((loja) => (
              <button
                key={loja.id}
                onClick={() => setLojaSelecionada(loja.id)}
                className={`folder-tab whitespace-nowrap px-4 py-2 text-sm font-medium font-mono transition-all ${
                  lojaSelecionada === loja.id
                    ? 'bg-paper text-ink'
                    : 'bg-kraft-dark/30 text-ink/60 hover:text-ink/80'
                }`}
              >
                {loja.nome}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-paper rounded-md border border-ink/12 p-4 font-mono">
            <p className="text-[10px] uppercase tracking-wider text-twine">Total estoque</p>
            <p className="text-xl md:text-2xl font-semibold text-ink leading-tight mt-1">
              R$ {valorTotalEstoque.toFixed(2)}
            </p>
          </div>
          <div className="bg-paper rounded-md border border-ink/12 p-4 font-mono">
            <p className="text-[10px] uppercase tracking-wider text-twine">Produtos</p>
            <p className="text-xl md:text-2xl font-semibold text-ink leading-tight mt-1">
              {totalProdutos}
            </p>
          </div>
          <div className="bg-paper rounded-md border border-ink/12 p-4 font-mono">
            <p className="text-[10px] uppercase tracking-wider text-twine">Items em estoque</p>
            <p className="text-xl md:text-2xl font-semibold text-ink leading-tight mt-1">
              {totalItens}
            </p>
          </div>
          <div className="bg-paper rounded-md border border-ink/12 p-4 font-mono">
            <p className="text-[10px] uppercase tracking-wider text-twine">Estoque baixo</p>
            <p className={`text-xl md:text-2xl font-semibold leading-tight mt-1 ${estoqueBaixoCount > 0 ? 'text-stamp' : 'text-ink'}`}>
              {estoqueBaixoCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {cotacao && (
              <span className="text-xs font-mono text-twine bg-paper rounded-full px-3 py-1 border border-ink/10">
                usd/brl R$ {cotacao.toFixed(4)}
              </span>
            )}
            {lojaAtual && (
              <span className="text-xs font-mono text-ink/60">
                {lojaAtual.nome}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono w-full sm:w-48"
            />
            {categorias.length > 0 && (
              <select
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono"
              >
                <option value="">todas</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <form
          onSubmit={handleCriarProduto}
          className="bg-paper rounded-md border border-ink/12 p-4 flex flex-wrap gap-2 items-end"
        >
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">produto</label>
            <input
              required
              value={novoProduto.nome}
              onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper"
            />
          </div>

          <div className="w-20">
            <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">moeda</label>
            <select
              value={novoProduto.moeda}
              onChange={(e) => setNovoProduto({ ...novoProduto, moeda: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-2 py-2 text-sm font-mono input-tag bg-paper"
            >
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>
          </div>

          {novoProduto.moeda === 'USD' ? (
            <div className="w-28">
              <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">valor (usd)</label>
              <input
                required
                type="number"
                step="0.01"
                value={novoProduto.valor_usd}
                onChange={(e) => setNovoProduto({ ...novoProduto, valor_usd: e.target.value })}
                className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper"
              />
            </div>
          ) : (
            <div className="w-28">
              <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">valor (brl)</label>
              <input
                required
                type="number"
                step="0.01"
                value={novoProduto.valor_brl}
                onChange={(e) => setNovoProduto({ ...novoProduto, valor_brl: e.target.value })}
                className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper"
              />
            </div>
          )}

          <div className="w-20">
            <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">qtd</label>
            <input
              required
              type="number"
              value={novoProduto.quantidade}
              onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper"
            />
          </div>

          <div className="w-28">
            <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">categoria</label>
            <input
              value={novoProduto.categoria}
              onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
              placeholder="opcional"
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper"
            />
          </div>

          <button
            type="submit"
            disabled={criando}
            className="bg-ink text-paper px-5 py-2 rounded-md text-sm font-medium btn-press disabled:opacity-50"
          >
            {criando ? '...' : 'Adicionar'}
          </button>
        </form>

        {erro && <p className="text-sm text-stamp font-mono">{erro}</p>}

        {busca && produtosFiltrados.length === 0 && !carregando && (
          <p className="text-sm text-ink/50 font-mono text-center py-8">
            nenhum produto encontrado para &ldquo;{busca}&rdquo;
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {carregando ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : produtosFiltrados.length > 0 ? (
            produtosFiltrados.map((produto, i) => (
              <div
                key={produto.id}
                className="card-enter"
                style={{ animationDelay: `${(i % 8) * 0.06}s` }}
              >
                <ProdutoCard produto={produto} onAtualizar={carregarProdutos} />
              </div>
            ))
          ) : (
            !busca && (
              <div className="col-span-2 text-center py-12 font-mono">
                <p className="text-ink/40 text-sm">nenhum produto cadastrado</p>
                <p className="text-ink/30 text-xs mt-2">adicione produtos usando o formulário acima</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
