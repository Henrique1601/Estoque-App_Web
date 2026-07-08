import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-kraft">
      <form onSubmit={handleSubmit} className="tag-card p-8 pl-9 w-full max-w-sm space-y-4">
        <span className="tag-hole" aria-hidden="true" />

        <h1 className="font-mono text-lg font-medium text-ink text-center tracking-wide">
          ESTOQUE<span className="text-stamp">•</span>CONTROLE
        </h1>

        <div>
          <label className="block text-xs text-twine mb-1 font-mono">email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>

        <div>
          <label className="block text-xs text-twine mb-1 font-mono">senha</label>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>

        {erro && <p className="text-sm text-stamp font-mono">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-ink text-paper rounded-md py-2 font-medium hover:bg-ink/85 disabled:opacity-50"
        >
          {carregando ? 'entrando...' : 'entrar'}
        </button>
      </form>
    </div>
  );
}
