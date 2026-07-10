import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Navbar from '../components/Navbar.jsx';

const TIPO_CORES = {
  entrada: { bg: 'bg-[#22c55e]/10 text-[#22c55e]' },
  saida: { bg: 'bg-[#ef4444]/10 text-[#ef4444]' },
  ajuste: { bg: 'bg-[#f59e0b]/10 text-[#f59e0b]' },
};

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroLoja, setFiltroLoja] = useState('');
  const [busca, setBusca] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const limite = 30;

  useEffect(() => {
    api.listarLojas().then(setLojas).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCarregando(true);
      try {
        const data = await api.listarMovimentacoes({
          tipo: filtroTipo || undefined,
          loja_id: filtroLoja || undefined,
          busca: busca || undefined,
          data_inicio: dataInicio || undefined,
          data_fim: dataFim || undefined,
          page: pagina,
          limit: limite,
        });
        if (cancelado) return;
        setMovimentacoes(data.movimentacoes);
        setTotal(data.total);
      } catch {
        if (!cancelado) setMovimentacoes([]);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [filtroTipo, filtroLoja, busca, dataInicio, dataFim, pagina]);

  const totalPaginas = Math.max(1, Math.ceil(total / limite));

  return (
    <div className="min-h-[100dvh] bg-kraft">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <h1 className="font-mono text-sm font-medium text-ink tracking-wide">Movimentações</h1>

        <div className="flex flex-wrap gap-2 items-center">
          <select value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1); }}
            className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono" aria-label="Filtrar por tipo">
            <option value="">todos os tipos</option>
            <option value="entrada">entrada</option>
            <option value="saida">saída</option>
            <option value="ajuste">ajuste</option>
          </select>

          <select value={filtroLoja}
            onChange={(e) => { setFiltroLoja(e.target.value); setPagina(1); }}
            className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono" aria-label="Filtrar por loja">
            <option value="">todas as lojas</option>
            {lojas.filter((l) => l.nome !== 'Central de Estoque').map((l) => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>

          <input type="date" value={dataInicio}
            onChange={(e) => { setDataInicio(e.target.value); setPagina(1); }}
            className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono" aria-label="Data início" />

          <input type="date" value={dataFim}
            onChange={(e) => { setDataFim(e.target.value); setPagina(1); }}
            className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono" aria-label="Data fim" />

          <input type="text" placeholder="buscar produto..." value={busca}
            onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
            className="border border-ink/20 rounded-md px-3 py-2 text-sm bg-paper input-tag font-mono w-44" aria-label="Buscar produto" />
        </div>

        <div className="bg-paper rounded-md border border-ink/12 overflow-x-auto">
          {carregando ? (
            <div className="p-5 text-sm font-mono text-ink/40 text-center">carregando...</div>
          ) : movimentacoes.length === 0 ? (
            <div className="p-5 text-sm font-mono text-ink/40 text-center">nenhuma movimentação encontrada</div>
          ) : (
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-ink/10 text-left">
                  <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-twine font-medium">Data</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-twine font-medium">Tipo</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-twine font-medium">Produto</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-twine font-medium">Loja</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-twine font-medium text-right">Qtd</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-twine font-medium text-right">Saldo</th>
                  <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-twine font-medium">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((m) => {
                  const tc = TIPO_CORES[m.tipo] || TIPO_CORES.ajuste;
                  return (
                    <tr key={m.id} className="border-b border-ink/5 hover:bg-kraft/30 transition-colors">
                      <td className="py-3 px-4 text-ink/60 whitespace-nowrap text-xs">
                        {new Date(m.criado_em).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${tc.bg}`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink">{m.produto_nome}</td>
                      <td className="py-3 px-4 text-ink/60">{m.loja_nome}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        <span className={m.tipo === 'entrada' ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                          {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-ink/70">
                        {m.saldo_anterior} → {m.saldo_posterior}
                      </td>
                      <td className="py-3 px-4 text-ink/50 text-xs">{m.usuario_nome || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2" role="navigation" aria-label="Paginação">
            <button disabled={pagina <= 1}
              onClick={() => setPagina(1)}
              className="text-xs font-mono text-ink/50 hover:text-ink disabled:opacity-30 px-2 py-1 rounded border border-ink/10 transition-colors"
              aria-label="Primeira página">
              primeira
            </button>
            <button disabled={pagina <= 1}
              onClick={() => setPagina(pagina - 1)}
              className="text-xs font-mono text-ink/50 hover:text-ink disabled:opacity-30 px-2 py-1 rounded border border-ink/10 transition-colors"
              aria-label="Página anterior">
              &lt;
            </button>
            <span className="text-xs font-mono text-ink/60 px-3">
              {pagina} / {totalPaginas}
            </span>
            <button disabled={pagina >= totalPaginas}
              onClick={() => setPagina(pagina + 1)}
              className="text-xs font-mono text-ink/50 hover:text-ink disabled:opacity-30 px-2 py-1 rounded border border-ink/10 transition-colors"
              aria-label="Próxima página">
              &gt;
            </button>
            <button disabled={pagina >= totalPaginas}
              onClick={() => setPagina(totalPaginas)}
              className="text-xs font-mono text-ink/50 hover:text-ink disabled:opacity-30 px-2 py-1 rounded border border-ink/10 transition-colors"
              aria-label="Última página">
              última
            </button>
          </div>
        )}
      </div>
    </div>
  );
}