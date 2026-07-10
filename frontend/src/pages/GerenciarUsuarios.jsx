import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function GerenciarUsuarios() {
  const addToast = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'vendedor', loja_id: '' });
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.listarUsuarios().then(setUsuarios).catch(() => {}).finally(() => setCarregando(false));
    api.listarLojas().then(setLojas).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCriando(true);
    try {
      const data = await api.criarUsuario({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        role: form.role,
        loja_id: form.loja_id ? Number(form.loja_id) : undefined,
      });
      setUsuarios((prev) => [data.usuario, ...prev]);
      setForm({ nome: '', email: '', senha: '', role: 'vendedor', loja_id: '' });
      addToast(`Usuário "${data.usuario.nome}" criado`, 'success');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCriando(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-kraft">
      <Navbar />
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        <h1 className="font-mono text-sm font-medium text-ink tracking-wide">Gerenciar usuários</h1>

        <form onSubmit={handleSubmit} className="tag-card p-5 space-y-3" style={{ transform: 'none' }}>
          <span className="tag-hole" aria-hidden="true" />
          <h2 className="font-mono text-sm font-medium text-ink">Novo usuário</h2>

          <div>
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">nome</label>
            <input required value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper font-mono" />
          </div>

          <div>
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">email</label>
            <input required type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper font-mono" />
          </div>

          <div>
            <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">senha</label>
            <input required type="password" minLength={6} value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper font-mono" />
          </div>

          <div className="flex gap-3">
            <div className="w-40">
              <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">papel</label>
              <select value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper">
                <option value="vendedor">vendedor</option>
                <option value="gerente">gerente</option>
              </select>
            </div>
            {form.role === 'gerente' && (
              <div className="flex-1">
                <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">loja</label>
                <select value={form.loja_id}
                  onChange={(e) => setForm({ ...form, loja_id: e.target.value })}
                  className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm font-mono input-tag bg-paper">
                  <option value="">selecione...</option>
                  {lojas.filter((l) => l.nome !== 'Central de Estoque').map((l) => (
                    <option key={l.id} value={l.id}>{l.nome}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {erro && <p className="text-sm text-stamp font-mono" role="alert">{erro}</p>}

          <button type="submit" disabled={criando}
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-medium btn-press disabled:opacity-50">
            {criando ? '...' : 'criar usuário'}
          </button>
        </form>

        <div className="bg-paper rounded-md border border-ink/12">
          <div className="px-5 py-4 border-b border-ink/10">
            <h2 className="font-mono text-sm font-medium text-ink">Usuários cadastrados</h2>
          </div>
          {carregando ? (
            <div className="p-5 text-sm font-mono text-ink/40 text-center">carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-ink/10 text-left">
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-twine font-medium">Nome</th>
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-twine font-medium">Email</th>
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-twine font-medium">Papel</th>
                    <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-twine font-medium">Loja</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id} className="border-b border-ink/5 hover:bg-kraft/30 transition-colors">
                      <td className="py-3 px-5 text-ink">{u.nome}</td>
                      <td className="py-3 px-5 text-ink/70">{u.email}</td>
                      <td className="py-3 px-5">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          u.role === 'admin' ? 'bg-[#1F2A24]/10 text-[#1F2A24]' :
                          u.role === 'gerente' ? 'bg-[#8B7355]/10 text-twine' :
                          'bg-[#4A6FA5]/10 text-[#4A6FA5]'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-ink/50">{u.loja_id || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}