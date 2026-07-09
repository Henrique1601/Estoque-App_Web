import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Navbar from '../components/Navbar.jsx';
import ProdutoCard from '../components/ProdutoCard.jsx';

const PRODUTO_VAZIO = { nome: '', moeda: 'USD', valor_usd: '', valor_brl: '', quantidade: '', categoria: '', loja_id: '' };

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

function ModalCriarProduto({ lojas, lojaPadrao, aoFechar, aoCriar }) {
  const [form, setForm] = useState({ ...PRODUTO_VAZIO, loja_id: lojaPadrao || (lojas[0]?.id || '') });
  const [erro, setErro] = useState('');
  const [criando, setCriando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCriando(true);
    try {
      await api.criarProduto({
        nome: form.nome,
        loja_id: Number(form.loja_id),
        moeda: form.moeda,
        valor_usd: form.moeda === 'USD' ? Number(form.valor_usd) : undefined,
        valor_brl: form.moeda === 'BRL' ? Number(form.valor_brl) : undefined,
        quantidade: Number(form.quantidade),
        categoria: form.categoria || undefined,
      });
      aoCriar();
      aoFechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setCriando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && aoFechar()}>
      <form
        onSubmit={handleSubmit}
        className="tag-card p-6 w-full max-w-md space-y-3 card-enter"
        style={{ animationDelay: '0s', transform: 'none' }}
      >
        <span className="tag-hole" aria-hidden="true" />
        <h2 className="font-mono text-sm font-medium text-ink tracking-wide">Novo produto</h2>

        {!lojaPadrao && (
          <div>
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">loja</label>
            <select
              required
              value={form.loja_id}
              onChange={(e) => setForm({ ...form, loja_id: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper"
            >
              <option value="">selecione...</option>
              {lojas.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">produto</label>
          <input required autoFocus value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper" />
        </div>

        <div className="flex gap-2">
          <div className="w-24">
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">moeda</label>
            <select value={form.moeda}
              onChange={(e) => setForm({ ...form, moeda: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-2 py-2 text-sm font-mono input-tag bg-paper">
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>
          </div>
          {form.moeda === 'USD' ? (
            <div className="flex-1">
              <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">valor (usd)</label>
              <input required type="number" step="0.01" value={form.valor_usd}
                onChange={(e) => setForm({ ...form, valor_usd: e.target.value })}
                className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper" />
            </div>
          ) : (
            <div className="flex-1">
              <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">valor (brl)</label>
              <input required type="number" step="0.01" value={form.valor_brl}
                onChange={(e) => setForm({ ...form, valor_brl: e.target.value })}
                className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper" />
            </div>
          )}
          <div className="w-20">
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">qtd</label>
            <input required type="number" value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">categoria</label>
          <input value={form.categoria} placeholder="opcional"
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper" />
        </div>

        {erro && <p className="text-sm text-stamp font-mono">{erro}</p>}

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={criando}
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium btn-press disabled:opacity-50">
            {criando ? '...' : 'adicionar'}
          </button>
          <button type="button" onClick={aoFechar}
            className="border border-ink/20 px-4 py-2 rounded-md text-sm btn-press">
            cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const addToast = useToast();
  const [lojas, setLojas] = useState([]);
  const [aba, setAba] = useState('central');
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [busca, setBusca] = useState('');
  const [cotacao, setCotacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  const abas = lojas.length > 0
    ? [{ id: 'central', nome: 'Central de Estoque' }, ...lojas]
    : [];

  useEffect(() => {
    api.listarLojas().then(setLojas);
    api.listarCategorias().then(setCategorias);
  }, []);

  async function carregarProdutos() {
    setCarregando(true);
    try {
      const lojaId = aba === 'central' ? undefined : aba;
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
    if (lojas.length > 0) carregarProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba, categoriaSelecionada, lojas.length]);

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const valorTotalEstoque = produtosFiltrados.reduce(
    (soma, p) => soma + Number(p.valor_brl) * Number(p.quantidade), 0
  );
  const totalProdutos = produtosFiltrados.length;
  const totalItens = produtosFiltrados.reduce((s, p) => s + Number(p.quantidade), 0);
  const estoqueBaixoCount = produtosFiltrados.filter((p) => p.quantidade <= 5).length;

  const lojaPadraoModal = aba === 'central' ? null : Number(aba);

  return (
    <div className="min-h-[100dvh] bg-kraft">
      <Navbar />

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {usuario.role === 'admin' && abas.length > 0 && (
          <div className="flex gap-1 overflow-x-auto pb-1">
            {abas.map((ab) => (
              <button
                key={ab.id}
                onClick={() => setAba(ab.id)}
                className={`folder-tab whitespace-nowrap px-4 py-2 text-sm font-medium font-mono transition-all ${
                  aba === ab.id ? 'bg-paper text-ink' : 'bg-kraft-dark/30 text-ink/60 hover:text-ink/80'
                }`}
              >
                {ab.nome}
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
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text" placeholder="buscar produto..." value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono w-full sm:w-48"
            />
            {categorias.length > 0 && (
              <select value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono">
                <option value="">todas</option>
                {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium btn-press"
            >
              + novo
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
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </>
          ) : produtosFiltrados.length > 0 ? (
            produtosFiltrados.map((produto, i) => (
              <div key={produto.id} className="card-enter"
                style={{ animationDelay: `${(i % 8) * 0.06}s` }}>
                <ProdutoCard produto={produto} onAtualizar={carregarProdutos} />
              </div>
            ))
          ) : (
            !busca && (
              <div className="col-span-2 text-center py-12 font-mono">
                <p className="text-ink/40 text-sm">nenhum produto cadastrado</p>
                <p className="text-ink/30 text-xs mt-2">clique em &ldquo;+ novo&rdquo; para adicionar</p>
              </div>
            )
          )}
        </div>

        {mostrarModal && (
          <ModalCriarProduto
            lojas={lojas}
            lojaPadrao={lojaPadraoModal}
            aoFechar={() => setMostrarModal(false)}
            aoCriar={() => addToast('Produto adicionado', 'success')}
          />
        )}
      </div>
    </div>
  );
}
