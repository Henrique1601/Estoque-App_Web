import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CORES_CELULAR, corToHex } from '../constants/coresCelular.js';
import { useFocusTrap, salvarFoco, restaurarFoco } from '../hooks/useFocusTrap.js';
import Navbar from '../components/Navbar.jsx';
import ProdutoCard from '../components/ProdutoCard.jsx';

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

function SelectorCores({ value, onChange }) {
  const [pesquisa, setPesquisa] = useState('');
  const filtradas = CORES_CELULAR.filter((c) =>
    c.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <div>
      <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">
        cor
      </label>
      <input
        type="text" placeholder="buscar ou digitar cor..." value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper mb-2"
        aria-label="Buscar cor"
      />
      {pesquisa && filtradas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto mb-2 p-1.5 border border-ink/10 rounded-md bg-kraft-dark/10" role="listbox" aria-label="Cores sugeridas">
          {filtradas.slice(0, 20).map((cor) => (
            <button
              key={cor} type="button" role="option" aria-selected={value === cor}
              onClick={() => { onChange(cor); setPesquisa(''); }}
              className={`text-xs px-2 py-1 rounded border transition-all ${
                value === cor
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper text-ink/70 border-ink/15 hover:border-ink/40'
              }`}
            >
              {cor}
            </button>
          ))}
        </div>
      )}
      <input
        type="text" placeholder="cor personalizada..." value={CORES_CELULAR.includes(value) ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper"
        aria-label="Cor personalizada"
      />
      {value && (
        <span className="inline-flex items-center gap-1.5 text-xs text-ink/70 mt-1 font-mono" aria-live="polite">
          <span className="inline-block w-3 h-3 rounded-full border border-ink/20"
            style={{ backgroundColor: corToHex(value) }}
          />
          {value}
        </span>
      )}
    </div>
  );
}

function ModalCriarProduto({ lojas, lojaPadrao, aoFechar, aoCriar }) {
  const ref = useRef(null);
  useFocusTrap(true, ref);

  useEffect(() => {
    salvarFoco();
    function handleEsc(e) { if (e.key === 'Escape') aoFechar(); }
    document.addEventListener('keydown', handleEsc);
    return () => { restaurarFoco(); document.removeEventListener('keydown', handleEsc); };
  }, [aoFechar]);

  const [form, setForm] = useState({ nome: '', moeda: 'USD', valor_usd: '', valor_brl: '', quantidade: '', categoria: '', cor: '', codigo_barras: '', loja_id: lojaPadrao || (lojas[0]?.id || '') });
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
        cor: form.cor || undefined,
        codigo_barras: form.codigo_barras || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Novo produto"
      onClick={(e) => e.target === e.currentTarget && aoFechar()}>
      <form onSubmit={handleSubmit} ref={ref}
        className="tag-card p-6 w-full max-w-md space-y-3 card-enter"
        style={{ animationDelay: '0s' }}
      >
        <span className="tag-hole" aria-hidden="true" />
        <h2 className="font-mono text-sm font-medium text-ink tracking-wide">Novo produto</h2>

        {!lojaPadrao && (
          <div>
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">loja</label>
            <select required value={form.loja_id}
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

        <div>
          <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">código de barras</label>
          <input value={form.codigo_barras} placeholder="opcional"
            onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
            className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper" />
        </div>

        <SelectorCores value={form.cor} onChange={(cor) => setForm({ ...form, cor })} />

        {erro && <p className="text-sm text-stamp font-mono" role="alert">{erro}</p>}

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={criando}
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium btn-press disabled:opacity-50" aria-busy={criando}>
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
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [busca, setBusca] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [cotacao, setCotacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [erroCarregar, setErroCarregar] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const buscaRef = useRef(null);
  const limite = 20;

  const lojasFisicas = lojas.filter((l) => l.nome !== 'Central de Estoque');
  const abas = lojasFisicas.length > 0
    ? [{ id: 'central', nome: 'Central de Estoque' }, ...lojasFisicas]
    : [];

  useEffect(() => {
    api.listarLojas().then(setLojas);
    api.listarCategorias()
      .then(setCategorias)
      .catch(() => {})
      .finally(() => setCarregandoCategorias(false));
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setMostrarModal((v) => !v);
      }
      if ((e.ctrlKey && e.key === 'f') || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        buscaRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Reseta pra página 1 sempre que os filtros mudam
  useEffect(() => {
    if (lojas.length > 0) setPagina(1);
  }, [aba, categoriaSelecionada, busca, sortBy, sortOrder, lojas.length]);

  // Carrega produtos conforme página e filtros atuais
  useEffect(() => {
    if (lojas.length === 0) return;
    let cancelado = false;
    (async () => {
      setCarregando(true);
      setErroCarregar(null);
      try {
        const lojaId = aba === 'central' ? undefined : aba;
        const data = await api.listarProdutos({
          lojaId,
          categoria: categoriaSelecionada || undefined,
          busca: busca || undefined,
          sort_by: sortBy || undefined,
          order: sortOrder,
          page: pagina,
          limit: limite,
        });
        if (cancelado) return;
        setProdutos(data.produtos || data);
        setTotal(data.total || data.length || 0);
        setCotacao(data.cotacao || null);
      } catch (err) {
        if (cancelado) return;
        setErroCarregar(err.message);
        addToast('Erro ao carregar produtos', 'error');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [pagina, aba, categoriaSelecionada, busca, sortBy, sortOrder, lojas.length, reloadKey, addToast]);

  const lojaMap = useCallback((id) => {
    const l = lojasFisicas.find((l) => l.id === id);
    return l ? l.nome : null;
  }, [lojasFisicas]);

  const valorTotalEstoque = produtos.reduce(
    (soma, p) => soma + Number(p.valor_brl) * Number(p.quantidade), 0
  );
  const totalProdutos = produtos.length;
  const totalItens = produtos.reduce((s, p) => s + Number(p.quantidade), 0);
  const estoqueBaixoCount = produtos.filter((p) => p.quantidade <= 5).length;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));

  const lojaPadraoModal = aba === 'central' ? null : Number(aba);

  function alternarOrdem(col) {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  }

  const opcoesOrdenacao = [
    { value: '', label: 'padrão' },
    { value: 'nome', label: 'nome A-Z' },
    { value: 'valor_brl', label: 'menor preço' },
    { value: 'quantidade', label: 'menor qtd' },
    { value: 'criado_em', label: 'mais antigos' },
  ];

  function labelOrdenacao() {
    const op = opcoesOrdenacao.find((o) => o.value === sortBy);
    if (!op) return 'padrão';
    const dir = sortOrder === 'asc' ? '↑' : '↓';
    const labels = {
      nome: 'nome',
      valor_brl: 'preço',
      quantidade: 'qtd',
      criado_em: 'data',
    };
    return `${labels[sortBy] || sortBy} ${dir}`;
  }

  return (
    <div className="min-h-[100dvh] bg-kraft">
      <Navbar />

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {usuario.role === 'admin' && abas.length > 0 && (
          <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Lojas">
            {abas.map((ab) => (
              <button
                key={ab.id} role="tab" aria-selected={aba === ab.id}
                onClick={() => setAba(ab.id)}
                className={`folder-tab whitespace-nowrap px-4 py-2 text-sm font-medium font-mono transition-all flex items-center gap-2 ${
                  aba === ab.id ? 'bg-paper text-ink' : 'bg-kraft-dark/30 text-ink/60 hover:text-ink/80'
                }`}
              >
                {aba === ab.id && carregando && (
                  <span className="inline-block w-2 h-2 rounded-full bg-stamp animate-pulse" aria-hidden="true" />
                )}
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
              <span className="text-xs font-mono text-twine bg-paper rounded-full px-3 py-1 border border-ink/10 flex items-center gap-1.5">
                usd/brl R$ {cotacao.toFixed(4)}
              </span>
            )}
            <button
              onClick={async () => {
                try {
                  const res = await api.recalcularPrecos();
                  addToast(`${res.produtosAtualizados} produtos recalculados (R$ ${res.cotacao})`, 'success');
                  setReloadKey((k) => k + 1);
                } catch (err) {
                  addToast('Erro ao recalcular: ' + err.message, 'error');
                }
              }}
              className="text-xs font-mono text-twine hover:text-ink border border-ink/10 hover:border-ink/30 rounded-full px-3 py-1 transition-colors"
              aria-label="Recalcular preços com a cotação atual"
            >
              recalcular
            </button>
            <button
              onClick={async () => {
                try {
                  const blob = await api.exportarCSV();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'produtos.csv';
                  document.body.appendChild(a); a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  addToast('CSV exportado', 'success');
                } catch (err) {
                  addToast('Erro ao exportar: ' + err.message, 'error');
                }
              }}
              className="text-xs font-mono text-twine hover:text-ink border border-ink/10 hover:border-ink/30 rounded-full px-3 py-1 transition-colors"
              aria-label="Exportar produtos como CSV"
            >
              csv
            </button>
            <label className="text-xs font-mono text-twine hover:text-ink border border-ink/10 hover:border-ink/30 rounded-full px-3 py-1 transition-colors cursor-pointer" aria-label="Importar produtos de CSV">
              importar
              <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const texto = await file.text();
                  const linhas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
                  if (linhas.length < 2) { addToast('CSV vazio', 'error'); return; }
                  const cabecalho = linhas[0].split(',').map((h) => h.trim().toLowerCase());
                  const produtos = linhas.slice(1).map((linha) => {
                    const vals = linha.split(',').map((v) => v.trim().replace(/^"(.*)"$/, '$1'));
                    const obj = {};
                    cabecalho.forEach((h, i) => { obj[h] = vals[i] || undefined; });
                    return obj;
                  });
                  const res = await api.importarProdutos(produtos);
                  addToast(`${res.criados} produtos importados${res.erros?.length ? `, ${res.erros.length} erros` : ''}`, res.erros?.length ? 'warning' : 'success');
                  setReloadKey((k) => k + 1);
                } catch (err) {
                  addToast('Erro ao importar: ' + err.message, 'error');
                }
                e.target.value = '';
              }} />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={buscaRef}
              type="text" placeholder="buscar produto... (Ctrl+F)" value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono w-full sm:w-44"
              aria-label="Buscar produto"
            />
            <button
              onClick={() => alternarOrdem(sortBy || 'nome')}
              className="border border-ink/20 rounded-md px-3 py-2 text-sm font-mono bg-paper input-tag hover:border-ink/40 transition-colors flex items-center gap-1.5"
              aria-label={`Ordenar por ${labelOrdenacao()}`}
              title={`Ordenar: ${labelOrdenacao()}`}
            >
              <span aria-hidden="true">⇅</span>
              <span className="hidden sm:inline">{labelOrdenacao()}</span>
            </button>
            {carregandoCategorias ? (
              <select disabled
                className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono text-ink/40">
                <option>carregando...</option>
              </select>
            ) : categorias.length > 0 && (
              <select value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono" aria-label="Filtrar por categoria">
                <option value="">todas</option>
                {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium btn-press" aria-label="Adicionar novo produto (Ctrl+N)"
            >
              + novo
            </button>
          </div>
        </div>

        {erroCarregar && (
          <div className="bg-stamp/10 border border-stamp/30 rounded-md p-4 text-sm font-mono text-stamp text-center" role="alert">
            Erro ao carregar: {erroCarregar}
            <button onClick={() => setReloadKey((k) => k + 1)} className="ml-3 underline hover:no-underline">tentar novamente</button>
          </div>
        )}

        {busca && produtos.length === 0 && !carregando && (
          <p className="text-sm text-ink/50 font-mono text-center py-8">
            nenhum produto encontrado para &ldquo;{busca}&rdquo;
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2" role="feed" aria-label="Lista de produtos" aria-busy={carregando}>
          {carregando ? (
            <>
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </>
          ) : produtos.length > 0 ? (
            produtos.map((produto, i) => (
              <div key={produto.id} className="card-enter"
                style={{ animationDelay: `${(i % 8) * 0.06}s` }}>
                <ProdutoCard
                  produto={produto}
                  onAtualizar={() => setReloadKey((k) => k + 1)}
                  lojaNome={aba === 'central' ? lojaMap(produto.loja_id) : undefined}
                />
              </div>
            ))
          ) : (
            !busca && !erroCarregar && (
              <div className="col-span-2 text-center py-12 font-mono">
                <p className="text-ink/40 text-sm">nenhum produto cadastrado</p>
                <p className="text-ink/30 text-xs mt-2">clique em &ldquo;+ novo&rdquo; para adicionar</p>
              </div>
            )
          )}
        </div>

        {totalPaginas > 1 && !carregando && (
          <div className="flex items-center justify-center gap-2 pt-2 pb-4" role="navigation" aria-label="Paginação">
            <button disabled={pagina <= 1}
              onClick={() => setPagina(1)}
              className="text-xs font-mono text-ink/50 hover:text-ink disabled:opacity-30 px-2 py-1 rounded border border-ink/10 transition-colors">
              primeira
            </button>
            <button disabled={pagina <= 1}
              onClick={() => setPagina(pagina - 1)}
              className="text-xs font-mono text-ink/50 hover:text-ink disabled:opacity-30 px-2 py-1 rounded border border-ink/10 transition-colors">
              &lt;
            </button>
            <span className="text-xs font-mono text-ink/60 px-3">
              {pagina} / {totalPaginas}
            </span>
            <button disabled={pagina >= totalPaginas}
              onClick={() => setPagina(pagina + 1)}
              className="text-xs font-mono text-ink/50 hover:text-ink disabled:opacity-30 px-2 py-1 rounded border border-ink/10 transition-colors">
              &gt;
            </button>
            <button disabled={pagina >= totalPaginas}
              onClick={() => setPagina(totalPaginas)}
              className="text-xs font-mono text-ink/50 hover:text-ink disabled:opacity-30 px-2 py-1 rounded border border-ink/10 transition-colors">
              última
            </button>
          </div>
        )}

        {mostrarModal && createPortal(
          <ModalCriarProduto
            lojas={lojasFisicas}
            lojaPadrao={lojaPadraoModal}
            aoFechar={() => setMostrarModal(false)}
            aoCriar={() => {
              addToast('Produto adicionado', 'success');
              setPagina(1);
              setReloadKey((k) => k + 1);
            }}
          />,
          document.body
        )}
      </div>
    </div>
  );
}
