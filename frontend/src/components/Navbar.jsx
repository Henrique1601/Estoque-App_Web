import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { usuario, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-ink/95 backdrop-blur-sm text-paper px-6 py-3 flex justify-between items-center border-b border-paper/10">
      <span className="font-mono font-medium tracking-wide text-sm md:text-base">
        ESTOQUE<span className="text-stamp">•</span>CONTROLE
      </span>
      <div className="flex items-center gap-3 md:gap-4 text-sm font-mono">
        <span className="hidden sm:inline text-paper/80">
          {usuario?.nome}
        </span>
        <span className="text-[10px] uppercase tracking-wider bg-paper/10 px-2 py-0.5 rounded-full">
          {usuario?.role}
        </span>
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
