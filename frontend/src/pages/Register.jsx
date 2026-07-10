import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const data = await api.register(nome, email, senha);
      setAuth(data);
      navigate('/');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-kraft p-4">
      <form
        onSubmit={handleSubmit}
        className="tag-card p-8 pl-9 w-full max-w-sm space-y-4 card-enter"
        style={{ animationDelay: '0s' }}
      >
        <span className="tag-hole" aria-hidden="true" />

        <h1 className="font-mono text-lg font-medium text-ink text-center tracking-wide">
          Criar conta
        </h1>

        <div>
          <label className="block text-xs text-twine mb-1.5 font-mono uppercase tracking-wider">nome</label>
          <input
            type="text"
            required
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-paper text-sm input-tag"
          />
        </div>

        <div>
          <label className="block text-xs text-twine mb-1.5 font-mono uppercase tracking-wider">email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-paper text-sm input-tag"
          />
        </div>

        <div>
          <label className="block text-xs text-twine mb-1.5 font-mono uppercase tracking-wider">senha</label>
          <input
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-paper text-sm input-tag"
          />
        </div>

        {erro && (
          <p className="text-sm text-stamp font-mono bg-stamp/5 border border-stamp/20 rounded-md px-3 py-2" role="alert">{erro}</p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-ink text-paper rounded-md py-2.5 font-medium btn-press disabled:opacity-50 text-sm"
        >
          {carregando ? 'criando...' : 'criar conta'}
        </button>

        <p className="text-xs text-center text-twine font-mono">
          já tem conta?{' '}
          <Link to="/login" className="text-ink underline hover:no-underline">entrar</Link>
        </p>
      </form>
    </div>
  );
}
