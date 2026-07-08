import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { usuario, logout } = useAuth();

  return (
    <nav className="bg-ink text-paper px-6 py-3 flex justify-between items-center">
      <span className="font-mono font-medium tracking-wide">
        ESTOQUE<span className="text-stamp">•</span>CONTROLE
      </span>
      <div className="flex items-center gap-4 text-sm font-mono">
        <span className="text-paper/80">
          {usuario?.nome} <span className="text-twine">[{usuario?.role}]</span>
        </span>
        <button
          onClick={logout}
          className="border border-paper/30 hover:border-paper/60 px-3 py-1 rounded-md"
        >
          sair
        </button>
      </div>
    </nav>
  );
}
