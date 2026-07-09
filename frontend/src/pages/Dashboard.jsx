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
  const [lojaSelecionada, setLojaSelecionada] = useState('todas');
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [busca, setBusca] = useState('');
  const [cotacao, setCotacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoProduto, setNovoProduto] = useState(PRODUTO_VAZIO);
  const [lojaModal, setLojaModal] = useState('');
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    api.listarLojas().then((rows) => {
      setLojas(rows);
    });
    api.listarCategorias().then(setCategorias);
  }, []);

  async function carregarProdutos() {
    setCarregando(true);
    try {
      const lojaId = lojaSelecionada === 'todas' ? undefined : lojaSelecionada;
      const data = await api.listarProdutos(lojaId, categoriaSelecionada || undefined);
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

  function abrirModal() {
    setNovoProduto(PRODUTO_VAZIO);
    setLojaModal('');
    setModalAberto(true);
  }

  async function handleCriarProduto(e) {
    e.preventDefault();
    setCriando(true);
    try {
      const lojaId = usuario.role === 'admin' ? Number(lojaModal) : usuario.loja_id;
      if (!lojaId) {
        addToast('Selecione uma loja', 'error');
        setCriando(false);
        return;
      }
      await api.criarProduto({
        nome: novoProduto.nome,
        moeda: novoProduto.moeda,
        valor_usd: novoProduto.moeda === 'USD' ? Number(novoProduto.valor_usd) : undefined,
        valor_brl: novoProduto.moeda === 'BRL' ? Number(novoProduto.valor_brl) : undefined,
        quantidade: Number(novoProduto.quantidade),
        categoria: novoProduto.categoria || undefined,
        loja_id: lojaId,
      });
      setModalAberto(false);
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

  const lojasFiltro = lojas.filter((l) => l.nome !== 'Central de Estoque');
  const precisaLojaModal = lojaSelecionada === 'todas';

  return (
    <div className="min-h-[100dvh] bg-kraft">
      <Navbar />

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setLojaSelecionada('todas')}
            className={`folder-tab whitespace-nowrap px-4 py-2 text-sm font-medium font-mono transition-all ${
              lojaSelecionada === 'todas'
                ? 'bg-paper text-ink'
                : 'bg-kraft-dark/30 text-ink/60 hover:text-ink/80'
            }`}
          >
            Central de Estoque
          </button>
          {lojasFiltro.map((loja) => (
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-paper rounded-md border border-ink/12 p-4 font-mono">
            <p className="text-[10px] uppercase tracking-wider text-twine">Total estoque</p>
            <p className="text-xl md:text-2xl font-semibold text-ink leading-tight mt-1">R$ {valorTotalEstoque.toFixed(2)}</p>
          </div>
          <div className="bg-paper rounded-md border border-ink/12 p-4 font-mono">
            <p className="text-[10px] uppercase tracking-wider text-twine">Produtos</p>
            <p className="text-xl md:text-2xl font-semibold text-ink leading-tight mt-1">{totalProdutos}</p>
          </div>
          <div className="bg-paper rounded-md border border-ink/12 p-4 font-mono">
            <p className="text-[10px] uppercase tracking-wider text-twine">Items em estoque</p>
            <p className="text-xl md:text-2xl font-semibold text-ink leading-tight mt-1">{totalItens}</p>
          </div>
          <div className="bg-paper rounded-md border border-ink/12 p-4 font-mono">
            <p className="text-[10px] uppercase tracking-wider text-twine">Estoque baixo</p>
            <p className={`text-xl md:text-2xl font-semibold leading-tight mt-1 ${estoqueBaixoCount > 0 ? 'text-stamp' : 'text-ink'}`}>{estoqueBaixoCount}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {cotacao && (
              <span className="text-xs font-mono text-twine bg-paper rounded-full px-3 py-1 border border-ink/10">
                usd/brl R$ {cotacao.toFixed(4)}
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
            <button
              onClick={abrirModal}
              className="bg-ink text-paper px-5 py-2 rounded-md text-sm font-medium btn-press"
            >
              Adicionar
            </button>
          </div>
        </div>

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
              <div key={produto.id} className="card-enter" style={{ animationDelay: `${(i % 8) * 0.06}s` }}>
                <ProdutoCard produto={produto} onAtualizar={carregarProdutos} />
              </div>
            ))
          ) : (
            !busca && (
              <div className="col-span-2 text-center py-12 font-mono">
                <p className="text-ink/40 text-sm">nenhum produto cadastrado</p>
                <p className="text-ink/30 text-xs mt-2">clique em Adicionar para começar</p>
              </div>
            )
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          <form
            onSubmit={handleCriarProduto}
            className="tag-card p-8 pl-9 w-full max-w-md space-y-4 relative z-10"
            style={{ transform: 'none' }}
          >
            <span className="tag-hole" aria-hidden="true" />

            <h2 className="font-mono text-base font-medium text-ink tracking-wide">Adicionar produto</h2>

            {precisaLojaModal && (
              <div>
                <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">loja</label>
                <select
                  required
                  value={lojaModal}
                  onChange={(e) => setLojaModal(e.target.value)}
                  className="w-full border border-ink/20 rounded-md px-3 py-2.5 text-sm font-mono input-tag bg-paper"
                >
                  <option value="">selecione...</option>
                  {lojasFiltro.map((l) => (
                    <option key={l.id} value={l.id}>{l.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">produto</label>
              <input
                required
                autoFocus
                value={novoProduto.nome}
                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                className="w-full border border-ink/20 rounded-md px-3 py-2.5 text-sm input-tag bg-paper"
              />
            </div>

            <div className="flex gap-3">
              <div className="w-24">
                <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">moeda</label>
                <select
                  value={novoProduto.moeda}
                  onChange={(e) => setNovoProduto({ ...novoProduto, moeda: e.target.value })}
                  className="w-full border border-ink/20 rounded-md px-2 py-2.5 text-sm font-mono input-tag bg-paper"
                >
                  <option value="USD">USD</option>
                  <option value="BRL">BRL</option>
                </select>
              </div>

              {novoProduto.moeda === 'USD' ? (
                <div className="flex-1">
                  <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">valor (usd)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={novoProduto.valor_usd}
                    onChange={(e) => setNovoProduto({ ...novoProduto, valor_usd: e.target.value })}
                    className="w-full border border-ink/20 rounded-md px-3 py-2.5 text-sm font-mono input-tag bg-paper"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">valor (brl)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={novoProduto.valor_brl}
                    onChange={(e) => setNovoProduto({ ...novoProduto, valor_brl: e.target.value })}
                    className="w-full border border-ink/20 rounded-md px-3 py-2.5 text-sm font-mono input-tag bg-paper"
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
                  className="w-full border border-ink/20 rounded-md px-3 py-2.5 text-sm font-mono input-tag bg-paper"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-twine mb-1 font-mono uppercase tracking-wider">categoria</label>
              <input
                value={novoProduto.categoria}
                onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
                placeholder="opcional"
                className="w-full border border-ink/20 rounded-md px-3 py-2.5 text-sm input-tag bg-paper"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={criando}
                className="flex-1 bg-ink text-paper rounded-md py-2.5 text-sm font-medium btn-press disabled:opacity-50"
              >
                {criando ? 'adicionando...' : 'adicionar'}
              </button>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="border border-ink/20 rounded-md py-2.5 px-4 text-sm font-mono btn-press"
              >
                cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
