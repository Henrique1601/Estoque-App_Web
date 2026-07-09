import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { api } from '../api.js';
import Navbar from '../components/Navbar.jsx';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

function SkeletonCard() {
  return <div className="bg-paper rounded-md border border-ink/12 p-4 h-24 skeleton" />;
}

function ChartSkeleton() {
  return <div className="tag-card p-5 h-72 skeleton" style={{ transform: 'none' }} />;
}

function ResumoCard({ label, value, cor }) {
  return (
    <div className="bg-paper rounded-md border border-ink/12 p-4 font-mono">
      <p className="text-[10px] uppercase tracking-wider text-twine">{label}</p>
      <p className={`text-xl md:text-2xl font-semibold leading-tight mt-1 ${cor || 'text-ink'}`}>
        {value}
      </p>
    </div>
  );
}

const chartDefaults = {
  plugins: { legend: { labels: { font: { family: "'IBM Plex Mono', monospace" }, color: '#8B7355', boxWidth: 12, padding: 12 } } },
  scales: { x: { ticks: { font: { family: "'IBM Plex Mono', monospace" }, color: '#8B7355' }, grid: { color: 'rgba(139, 115, 85, 0.1)' } }, y: { ticks: { font: { family: "'IBM Plex Mono', monospace" }, color: '#8B7355' }, grid: { color: 'rgba(139, 115, 85, 0.1)' } } },
};

export default function Relatorios() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCarregando(true);
      setErro(null);
      try {
        const data = await api.relatorios();
        if (!cancelado) setDados(data);
      } catch (err) {
        if (!cancelado) setErro(err.message);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  const categoriasChart = dados ? {
    labels: dados.porCategoria.map((c) => c.categoria || 'sem categoria'),
    datasets: [{ data: dados.porCategoria.map((c) => c.quantidade), backgroundColor: ['#B23A2E', '#8B7355', '#1F2A24', '#E4DCC8', '#2D6A4F', '#C9BD9E', '#B8860B', '#4A6FA5'], borderWidth: 0 }],
  } : null;

  const lojasChart = dados ? {
    labels: dados.porLoja.map((l) => l.loja),
    datasets: [{ label: 'Valor (R$)', data: dados.porLoja.map((l) => Number(l.valor).toFixed(2)), backgroundColor: '#8B7355', borderRadius: 4 }],
  } : null;

  const vendasChart = dados ? {
    labels: dados.vendas.map((v) => v.dia.slice(5)),
    datasets: [
      { label: 'Qtd vendida', data: dados.vendas.map((v) => v.quantidade), borderColor: '#1F2A24', backgroundColor: 'rgba(31, 42, 36, 0.1)', fill: true, tension: 0.3, pointRadius: 2, yAxisID: 'y' },
      { label: 'Receita (R$)', data: dados.vendas.map((v) => Number(v.receita).toFixed(2)), borderColor: '#B23A2E', backgroundColor: 'rgba(178, 58, 46, 0.08)', fill: true, tension: 0.3, pointRadius: 2, yAxisID: 'y1' },
    ],
  } : null;

  const margensChart = dados ? {
    labels: dados.topMargens.map((m) => m.nome),
    datasets: [{
      label: 'Margem %', data: dados.topMargens.map((m) => m.margem),
      backgroundColor: dados.topMargens.map((m) => m.margem >= 30 ? '#2D6A4F' : m.margem >= 10 ? '#8B7355' : '#B23A2E'),
      borderRadius: 4,
    }],
  } : null;

  return (
    <div className="min-h-[100dvh] bg-kraft">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <h1 className="font-mono text-sm font-medium text-ink tracking-wide">Relatórios</h1>

        {erro && (
          <div className="bg-stamp/10 border border-stamp/30 rounded-md p-4 text-sm font-mono text-stamp text-center" role="alert">
            Erro ao carregar: {erro}
            <button onClick={() => window.location.reload()} className="ml-3 underline hover:no-underline">tentar novamente</button>
          </div>
        )}

        {carregando ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ChartSkeleton /><ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
            </div>
          </>
        ) : dados && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <ResumoCard label="Produtos" value={dados.resumo.totalProdutos} />
              <ResumoCard label="Itens em estoque" value={dados.resumo.totalItens} />
              <ResumoCard label="Valor estoque" value={`R$ ${Number(dados.resumo.valorEstoque).toFixed(2)}`} />
              <ResumoCard label="Valor custo" value={`R$ ${Number(dados.resumo.valorCusto).toFixed(2)}`} />
              <ResumoCard label="Margem média" value={dados.resumo.margemMedia != null ? `${dados.resumo.margemMedia}%` : '—'} cor={dados.resumo.margemMedia >= 30 ? 'text-[#2D6A4F]' : dados.resumo.margemMedia >= 10 ? 'text-twine' : 'text-stamp'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {categoriasChart && (
                <div className="tag-card p-5" style={{ transform: 'none' }}>
                  <h2 className="font-mono text-xs uppercase tracking-wider text-twine mb-4">Distribuição por categoria</h2>
                  <Doughnut data={categoriasChart} options={{ ...chartDefaults, cutout: '60%', plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: 'bottom' } } }} />
                </div>
              )}

              {lojasChart && (
                <div className="tag-card p-5" style={{ transform: 'none' }}>
                  <h2 className="font-mono text-xs uppercase tracking-wider text-twine mb-4">Valor de estoque por loja</h2>
                  <Bar data={lojasChart} options={{ ...chartDefaults, responsive: true, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
                </div>
              )}

              {vendasChart && (
                <div className="tag-card p-5 md:col-span-2" style={{ transform: 'none' }}>
                  <h2 className="font-mono text-xs uppercase tracking-wider text-twine mb-4">Vendas — últimos 30 dias</h2>
                  <Line data={vendasChart} options={{ ...chartDefaults, responsive: true, interaction: { mode: 'index', intersect: false }, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, position: 'left', title: { display: true, text: 'Qtd', font: { family: "'IBM Plex Mono', monospace" } } }, y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { font: { family: "'IBM Plex Mono', monospace" }, color: '#8B7355' }, title: { display: true, text: 'Receita (R$)', font: { family: "'IBM Plex Mono', monospace" } } } } }} />
                </div>
              )}

              {margensChart && (
                <div className="tag-card p-5 md:col-span-2" style={{ transform: 'none' }}>
                  <h2 className="font-mono text-xs uppercase tracking-wider text-twine mb-4">Top 10 margens de lucro</h2>
                  <Bar data={margensChart} options={{ ...chartDefaults, indexAxis: 'y', responsive: true, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
