import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function Perfil() {
  const { usuario, setUsuario } = useAuth();
  const addToast = useToast();
  const [nome, setNome] = useState(usuario?.nome || '');
  const [salvando, setSalvando] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [alterando, setAlterando] = useState(false);

  async function handleSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await api.atualizarPerfil(nome);
      setUsuario(res.usuario);
      addToast('Perfil atualizado', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSalvando(false);
    }
  }

  async function handleTrocarSenha(e) {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      addToast('Senhas não conferem', 'error');
      return;
    }
    setAlterando(true);
    try {
      await api.trocarSenha(senhaAtual, novaSenha);
      addToast('Senha alterada com sucesso', 'success');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setAlterando(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-kraft">
      <Navbar />
      <div className="max-w-lg mx-auto p-4 md:p-6 space-y-6">
        <h1 className="font-mono text-sm font-medium text-ink tracking-wide">Perfil</h1>

        <div className="bg-paper rounded-md border border-ink/12 p-5 space-y-3">
          <div className="font-mono text-xs text-twine uppercase tracking-wider">{usuario?.role}</div>
          <div className="font-mono text-sm text-ink">{usuario?.email}</div>
        </div>

        <form onSubmit={handleSalvar} className="tag-card p-5 space-y-3" style={{ transform: 'none' }}>
          <span className="tag-hole" aria-hidden="true" />
          <h2 className="font-mono text-sm font-medium text-ink">Alterar nome</h2>
          <input required value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper font-mono"
            aria-label="Nome"
          />
          <button type="submit" disabled={salvando}
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium btn-press disabled:opacity-50">
            {salvando ? '...' : 'salvar'}
          </button>
        </form>

        <form onSubmit={handleTrocarSenha} className="tag-card p-5 space-y-3" style={{ transform: 'none' }}>
          <span className="tag-hole" aria-hidden="true" />
          <h2 className="font-mono text-sm font-medium text-ink">Alterar senha</h2>
          <div>
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">senha atual</label>
            <input required type="password" value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">nova senha</label>
            <input required type="password" minLength={6} value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">confirmar nova senha</label>
            <input required type="password" minLength={6} value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper font-mono"
            />
          </div>
          <button type="submit" disabled={alterando}
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium btn-press disabled:opacity-50">
            {alterando ? '...' : 'alterar senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
