import { useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ProdutoCard({ produto, onAtualizar }) {
  const [quantidadeVenda, setQuantidadeVenda] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editNome, setEditNome] = useState(produto.nome);
  const [editQtd, setEditQtd] = useState(produto.quantidade);
  const [salvando, setSalvando] = useState(false);
  const addToast = useToast();

  const estoqueBaixo = produto.quantidade <= 5;

  async function handleVender() {
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

  async function handleRemover() {
    try {
      await api.removerProduto(produto.id);
      addToast(`"${produto.nome}" removido do estoque`, 'success');
      onAtualizar();
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function handleSalvarEdicao() {
    setSalvando(true);
    try {
      await api.atualizarProduto(produto.id, {
        nome: editNome,
        quantidade: Number(editQtd),
      });
      addToast('Produto atualizado', 'success');
      setEditando(false);
      onAtualizar();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSalvando(false);
    }
  }

  function cancelarEdicao() {
    setEditNome(produto.nome);
    setEditQtd(produto.quantidade);
    setEditando(false);
  }

  return (
    <div className={`tag-card p-4 pl-6 ${editando ? 'tag-card-edit-active' : ''} card-enter`}
      style={{ animationDelay: '0s' }}
    >
      <span className="tag-hole" aria-hidden="true" />
      {estoqueBaixo && <span className="stamp">REPOR ESTOQUE</span>}

      {editando ? (
        <div className="space-y-2">
          <input
            value={editNome}
            onChange={(e) => setEditNome(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-medium input-tag bg-paper"
            autoFocus
          />
          <div className="flex gap-2">
            <div>
              <label className="block text-[10px] text-twine font-mono mb-0.5">quantidade</label>
              <input
                type="number"
                value={editQtd}
                onChange={(e) => setEditQtd(e.target.value)}
                className="w-20 border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSalvarEdicao}
              disabled={salvando}
              className="text-xs bg-ink text-paper px-3 py-1.5 rounded-md btn-press disabled:opacity-50"
            >
              {salvando ? 'salvando...' : 'salvar'}
            </button>
            <button
              onClick={cancelarEdicao}
              className="text-xs border border-ink/20 px-3 py-1.5 rounded-md btn-press"
            >
              cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2 pr-16">
            <h3 className="font-medium text-ink leading-tight">{produto.nome}</h3>
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
            <p className={`text-sm ${estoqueBaixo ? 'text-stamp font-medium' : 'text-ink/70'}`}>
              estoque: {produto.quantidade}
            </p>
          </div>

          {produto.observacao && (
            <p className="text-xs text-stamp/80 mt-1 italic leading-relaxed">{produto.observacao}</p>
          )}

          <div className="flex items-center gap-2 pt-3 border-t border-dashed border-ink/15 mt-3">
            <input
              type="number"
              min="1"
              max={produto.quantidade}
              value={quantidadeVenda}
              onChange={(e) => setQuantidadeVenda(e.target.value)}
              className="w-16 border border-ink/20 rounded-md px-2 py-1.5 text-sm font-mono input-tag bg-paper"
            />
            <button
              onClick={handleVender}
              disabled={carregando || produto.quantidade === 0}
              className="text-sm bg-ink text-paper px-3 py-1.5 rounded-md btn-press disabled:opacity-40"
            >
              {carregando ? '...' : 'Vender'}
            </button>
            <button
              onClick={() => setEditando(true)}
              className="text-xs text-twine hover:text-ink transition-colors ml-1"
            >
              editar
            </button>
            <button
              onClick={handleRemover}
              className="text-xs text-stamp/70 hover:text-stamp transition-colors ml-auto"
            >
              remover
            </button>
          </div>
        </>
      )}
    </div>
  );
}
