import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [senha, setSenha] = useState('');
  const [etapa, setEtapa] = useState('email');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSolicitar(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const data = await api.esqueciSenha(email);
      setToken(data.token);
      setEtapa('token');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinir(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await api.redefinirSenha(token, senha);
      setEtapa('pronto');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-kraft p-4">
      <div className="tag-card p-8 pl-9 w-full max-w-sm space-y-4 card-enter"
        style={{ animationDelay: '0s' }}
      >
        <span className="tag-hole" aria-hidden="true" />

        {etapa === 'email' && (
          <form onSubmit={handleSolicitar} className="space-y-4">
            <h1 className="font-mono text-lg font-medium text-ink text-center tracking-wide">
              Esqueci a senha
            </h1>
            <div>
              <label className="block text-xs text-twine mb-1.5 font-mono uppercase tracking-wider">email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-paper text-sm input-tag"
              />
            </div>
            {erro && (
              <p className="text-sm text-stamp font-mono bg-stamp/5 border border-stamp/20 rounded-md px-3 py-2">{erro}</p>
            )}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-ink text-paper rounded-md py-2.5 font-medium btn-press disabled:opacity-50 text-sm"
            >
              {carregando ? 'enviando...' : 'gerar token'}
            </button>
            <p className="text-xs text-center text-twine font-mono">
              <Link to="/login" className="text-ink underline hover:no-underline">voltar ao login</Link>
            </p>
          </form>
        )}

        {etapa === 'token' && (
          <form onSubmit={handleRedefinir} className="space-y-4">
            <h1 className="font-mono text-lg font-medium text-ink text-center tracking-wide">
              Redefinir senha
            </h1>

            <div className="bg-kraft/50 border border-ink/10 rounded-md px-3 py-2">
              <p className="text-[10px] text-twine font-mono uppercase tracking-wider mb-1">token</p>
              <p className="text-xs font-mono text-ink break-all">{token}</p>
            </div>

            <div>
              <label className="block text-xs text-twine mb-1.5 font-mono uppercase tracking-wider">nova senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-paper text-sm input-tag"
                autoFocus
              />
            </div>
            {erro && (
              <p className="text-sm text-stamp font-mono bg-stamp/5 border border-stamp/20 rounded-md px-3 py-2">{erro}</p>
            )}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-ink text-paper rounded-md py-2.5 font-medium btn-press disabled:opacity-50 text-sm"
            >
              {carregando ? 'redefinindo...' : 'redefinir senha'}
            </button>
          </form>
        )}

        {etapa === 'pronto' && (
          <div className="space-y-4 text-center">
            <h1 className="font-mono text-lg font-medium text-ink tracking-wide">
              Senha redefinida
            </h1>
            <p className="text-sm font-mono text-twine">
              Sua senha foi alterada com sucesso.
            </p>
            <Link
              to="/login"
              className="block w-full bg-ink text-paper rounded-md py-2.5 font-medium text-sm text-center btn-press"
            >
              entrar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
