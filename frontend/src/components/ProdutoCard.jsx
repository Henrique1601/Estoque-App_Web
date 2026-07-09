import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { corToHex } from '../constants/coresCelular.js';
import { useFocusTrap, salvarFoco, restaurarFoco } from '../hooks/useFocusTrap.js';
import ConfirmModal from './ConfirmModal.jsx';
import SelectorCores from './SelectorCores.jsx';

function ModalEditarProduto({ produto, aoFechar, aoSalvar }) {
  const ref = useRef(null);
  const salvarFocoExec = useRef(false);
  useFocusTrap(true, ref);

  useEffect(() => {
    if (!salvarFocoExec.current) { salvarFoco(); salvarFocoExec.current = true; }
    function handleEsc(e) { if (e.key === 'Escape') aoFechar(); }
    document.addEventListener('keydown', handleEsc);
    return () => { restaurarFoco(); document.removeEventListener('keydown', handleEsc); };
  }, [aoFechar]);

  const [form, setForm] = useState({
    nome: produto.nome, moeda: produto.moeda,
    valor_usd: produto.valor_usd ?? '', valor_brl: produto.valor_brl ?? '',
    custo_usd: produto.custo_usd ?? '', custo_brl: produto.custo_brl ?? '',
    quantidade: produto.quantidade, categoria: produto.categoria ?? '',
    cor: produto.cor ?? '', observacao: produto.observacao ?? '',
    codigo_barras: produto.codigo_barras ?? '',
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await api.atualizarProduto(produto.id, {
        nome: form.nome,
        valor_usd: form.moeda === 'USD' ? Number(form.valor_usd) : undefined,
        valor_brl: form.moeda === 'BRL' ? Number(form.valor_brl) : undefined,
        custo_usd: form.moeda === 'USD' && form.custo_usd ? Number(form.custo_usd) : undefined,
        custo_brl: form.moeda === 'BRL' && form.custo_brl ? Number(form.custo_brl) : undefined,
        quantidade: Number(form.quantidade),
        categoria: form.categoria || undefined,
        cor: form.cor || undefined,
        observacao: form.observacao || undefined,
        codigo_barras: form.codigo_barras || undefined,
      });
      aoSalvar();
      aoFechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Editar produto"
      onClick={(e) => e.target === e.currentTarget && aoFechar()}>
      <form onSubmit={handleSubmit} ref={ref}
        className="tag-card p-6 w-full max-w-md space-y-3 card-enter"
        style={{ animationDelay: '0s' }}
      >
        <span className="tag-hole" aria-hidden="true" />
        <h2 className="font-mono text-sm font-medium text-ink tracking-wide">Editar produto</h2>

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
          <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">custo ({form.moeda === 'USD' ? 'usd' : 'brl'})</label>
          <input type="number" step="0.01" value={form.moeda === 'USD' ? form.custo_usd : form.custo_brl} placeholder="opcional"
            onChange={(e) => setForm({ ...form, [form.moeda === 'USD' ? 'custo_usd' : 'custo_brl']: e.target.value })}
            className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper" />
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

        <SelectorCores simples value={form.cor} onChange={(cor) => setForm({ ...form, cor })} />

        <div>
          <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">observação</label>
          <textarea value={form.observacao} rows={2}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper" />
        </div>

        {erro && <p className="text-sm text-stamp font-mono" role="alert">{erro}</p>}

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={salvando}
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium btn-press disabled:opacity-50" aria-busy={salvando}>
            {salvando ? '...' : 'salvar'}
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

export default function ProdutoCard({ produto, onAtualizar, lojaNome }) {
  const [quantidadeVenda, setQuantidadeVenda] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmarVenda, setConfirmarVenda] = useState(false);
  const [confirmarRemocao, setConfirmarRemocao] = useState(false);
  const addToast = useToast();

  const estoqueBaixo = produto.quantidade <= 5;

  async function handleVender() {
    setConfirmarVenda(false);
    setCarregando(true);
    try {
      await api.venderProduto(produto.id, Number(quantidadeVenda));
      addToast(`Venda de "${produto.nome}" registrada`, 'success');
      onAtualizar();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCarregando(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') setConfirmarVenda(true);
  }

  async function handleRemover() {
    setConfirmarRemocao(false);
    setCarregando(true);
    try {
      await api.removerProduto(produto.id);
      addToast(`"${produto.nome}" removido`, 'success');
      onAtualizar();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <div className="tag-card p-4 pl-6 card-enter" style={{ animationDelay: '0s' }}>
        <span className="tag-hole" aria-hidden="true" />
        {estoqueBaixo && <span className="stamp" aria-live="polite">REPOR ESTOQUE</span>}

        <div className="flex items-start justify-between gap-2 pr-16">
          <h3 className="font-medium text-ink leading-tight">{produto.nome}</h3>
          <span className="flex items-center gap-1.5 shrink-0 mt-0.5">
            {lojaNome && (
              <span className="text-[10px] font-mono text-ink/40 bg-ink/5 rounded px-1.5 py-0.5">{lojaNome}</span>
            )}
            {produto.cor && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ink/50" aria-label={`Cor: ${produto.cor}`}>
                <span className="inline-block w-2.5 h-2.5 rounded-full border border-ink/20"
                  style={{ backgroundColor: corToHex(produto.cor) }}
                />
                {produto.cor}
              </span>
            )}
          </span>
        </div>

        {produto.categoria && (
          <span className="inline-block text-[10px] uppercase tracking-wide text-twine border border-twine/30 rounded-full px-2 py-0.5 mt-1.5">
            {produto.categoria}
          </span>
        )}

        <div className="mt-2 space-y-0.5 font-mono">
          <p className="text-2xl font-semibold text-ink leading-none tracking-tight">
            R$ {Number(produto.valor_brl).toFixed(2)}
          </p>
          {produto.moeda === 'USD' && (
            <p className="text-xs text-twine">USD {Number(produto.valor_usd).toFixed(2)}</p>
          )}
          {produto.margem != null && (
            <p className={`text-xs font-medium ${
              produto.margem >= 30 ? 'text-[#2D6A4F]' :
              produto.margem >= 10 ? 'text-twine' :
              'text-stamp'
            }`}>
              Margem: {produto.margem}%
            </p>
          )}
          <p className={`text-sm ${estoqueBaixo ? 'text-stamp font-medium' : 'text-ink/70'}`}>
            estoque: {produto.quantidade}
          </p>
        </div>

        {produto.observacao && (
          <p className="text-xs text-stamp/80 mt-1 italic leading-relaxed">{produto.observacao}</p>
        )}

        <div className="flex items-center gap-2 pt-3 border-t border-dashed border-ink/15 mt-3">
          <input type="number" min="1" max={produto.quantidade}
            value={quantidadeVenda}
            onChange={(e) => setQuantidadeVenda(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            className="w-16 border border-ink/20 rounded-md px-2 py-1.5 text-sm font-mono input-tag bg-paper"
            aria-label="Quantidade a vender"
          />
          <button onClick={() => setConfirmarVenda(true)} disabled={carregando || produto.quantidade === 0}
            className="text-sm bg-ink text-paper px-3 py-1.5 rounded-md btn-press disabled:opacity-40" aria-label={`Vender ${quantidadeVenda} unidades`} aria-busy={carregando}>
            {carregando ? '...' : 'Vender'}
          </button>
          <button onClick={() => setEditando(true)}
            className="text-xs text-twine hover:text-ink transition-colors ml-1" aria-label={`Editar ${produto.nome}`}>
            editar
          </button>
          <button onClick={() => setConfirmarRemocao(true)}
            className="text-xs text-stamp/70 hover:text-stamp transition-colors ml-auto" aria-label={`Remover ${produto.nome}`}>
            remover
          </button>
        </div>
      </div>

      <ConfirmModal
        aberto={confirmarVenda}
        titulo="Confirmar venda"
        mensagem={`Deseja vender ${quantidadeVenda} unidade${quantidadeVenda > 1 ? 's' : ''}?`}
        acao={produto.nome}
        acaoLabel="vender"
        aoFechar={() => setConfirmarVenda(false)}
        aoConfirmar={handleVender}
      />

      <ConfirmModal
        aberto={confirmarRemocao}
        titulo="Remover produto"
        mensagem={`Remover do estoque permanentemente?`}
        acao={produto.nome}
        acaoLabel="remover"
        aoFechar={() => setConfirmarRemocao(false)}
        aoConfirmar={handleRemover}
      />

      {editando && createPortal(
        <ModalEditarProduto
          produto={produto}
          aoFechar={() => setEditando(false)}
          aoSalvar={() => {
            addToast('Produto atualizado', 'success');
            onAtualizar();
          }}
        />,
        document.body
      )}
    </>
  );
}
