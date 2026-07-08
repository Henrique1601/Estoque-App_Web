import { useState } from 'react';
import { api } from '../api.js';

export default function ProdutoCard({ produto, onAtualizar }) {
  const [quantidadeVenda, setQuantidadeVenda] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const estoqueBaixo = produto.quantidade <= 5;

  async function handleVender() {
    setCarregando(true);
    try {
      await api.venderProduto(produto.id, Number(quantidadeVenda));
      onAtualizar();
    } catch (err) {
      alert(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleRemover() {
    if (!confirm(`Remover "${produto.nome}" do estoque?`)) return;
    await api.removerProduto(produto.id);
    onAtualizar();
  }

  return (
    <div className="tag-card p-4 pl-6">
      <span className="tag-hole" aria-hidden="true" />
      {estoqueBaixo && <span className="stamp">REPOR ESTOQUE</span>}

      <div className="flex items-start justify-between gap-2 pr-16">
        <h3 className="font-medium text-ink">{produto.nome}</h3>
      </div>
      {produto.categoria && (
        <span className="inline-block text-[10px] uppercase tracking-wide text-twine border border-twine/40 rounded-full px-2 py-0.5 mt-1">
          {produto.categoria}
        </span>
      )}

      <div className="mt-2 space-y-0.5 font-mono">
        <p className="text-2xl font-semibold text-ink leading-none">
          R$ {Number(produto.valor_brl).toFixed(2)}
        </p>
        {produto.moeda === 'USD' && (
          <p className="text-xs text-twine">USD {Number(produto.valor_usd).toFixed(2)}</p>
        )}
        <p className="text-sm text-ink/70">estoque: {produto.quantidade}</p>
      </div>

      {produto.observacao && (
        <p className="text-xs text-stamp/90 mt-1 italic">{produto.observacao}</p>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-dashed border-ink/15 mt-3">
        <input
          type="number"
          min="1"
          max={produto.quantidade}
          value={quantidadeVenda}
          onChange={(e) => setQuantidadeVenda(e.target.value)}
          className="w-16 border border-ink/20 rounded-md px-2 py-1 text-sm font-mono bg-paper"
        />
        <button
          onClick={handleVender}
          disabled={carregando || produto.quantidade === 0}
          className="text-sm bg-ink text-paper px-3 py-1 rounded-md hover:bg-ink/85 disabled:opacity-40"
        >
          Registrar venda
        </button>
        <button
          onClick={handleRemover}
          className="text-sm text-stamp hover:underline ml-auto"
        >
          Remover
        </button>
      </div>
    </div>
  );
}
