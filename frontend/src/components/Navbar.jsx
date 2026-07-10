import { useAuth } from '../context/AuthContext.jsx';
import { useTema } from '../context/ThemeContext.jsx';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const { tema, alternarTema } = useTema();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 bg-ink/95 backdrop-blur-sm text-paper px-6 py-3 flex justify-between items-center border-b border-paper/10">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-mono font-medium tracking-wide text-sm md:text-base hover:opacity-80 transition-opacity">
          ESTOQUE<span className="text-stamp">•</span>CONTROLE
        </Link>
        {usuario.role !== 'vendedor' && (
          <Link to="/relatorios"
            className="text-[10px] uppercase tracking-wider text-paper/60 hover:text-paper transition-colors font-mono">
            relatórios
          </Link>
        )}
        {usuario.role === 'admin' && (
          <Link to="/admin/usuarios"
            className="text-[10px] uppercase tracking-wider text-paper/60 hover:text-paper transition-colors font-mono">
            usuários
          </Link>
        )}
        <Link to="/perfil"
          className="text-[10px] uppercase tracking-wider text-paper/60 hover:text-paper transition-colors font-mono">
          perfil
        </Link>
      </div>
      <div className="flex items-center gap-3 md:gap-4 text-sm font-mono">
        <span className="hidden sm:inline text-paper/80">
          {usuario?.nome}
        </span>
        <span className="text-[10px] uppercase tracking-wider bg-paper/10 px-2 py-0.5 rounded-full">
          {usuario?.role}
        </span>
        <button
          onClick={alternarTema}
          className="border border-paper/25 hover:border-paper/50 hover:bg-paper/10 px-2.5 py-1.5 rounded-md text-xs transition-all duration-200 btn-press"
          aria-label={tema === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {tema === 'dark' ? '☀' : '☾'}
        </button>
        <button
          onClick={logout}
          className="border border-paper/25 hover:border-paper/50 hover:bg-paper/10 px-3 py-1.5 rounded-md text-xs transition-all duration-200 btn-press"
        >
          sair
        </button>
      </div>
    </nav>
  );
}
