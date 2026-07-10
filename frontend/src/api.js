const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('token');
}

let onUnauthorized = null;

export function setOnUnauthorized(cb) {
  onUnauthorized = cb;
}

async function request(path, options = {}) {
  const token = getToken();
  const resp = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (resp.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  if (!resp.ok) {
    const erro = await resp.json().catch(() => ({ erro: 'Erro desconhecido' }));
    throw new Error(erro.erro || `Erro ${resp.status}`);
  }

  if (resp.status === 204) return null;
  return resp.json();
}

async function requestBlob(path) {
  const token = getToken();
  const resp = await fetch(`${API_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!resp.ok) throw new Error(`Erro ${resp.status}`);
  return resp.blob();
}

export const api = {
  login: (email, senha) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  register: (nome, email, senha) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify({ nome, email, senha }) }),

  esqueciSenha: (email) =>
    request('/api/auth/esqueci-senha', { method: 'POST', body: JSON.stringify({ email }) }),

  redefinirSenha: (token, senha) =>
    request('/api/auth/redefinir-senha', { method: 'POST', body: JSON.stringify({ token, senha }) }),

  listarLojas: () => request('/api/lojas'),

  listarProdutos: ({ lojaId, categoria, busca, sort_by, order, page, limit } = {}) => {
    const params = new URLSearchParams();
    if (lojaId) params.set('loja_id', lojaId);
    if (categoria) params.set('categoria', categoria);
    if (busca) params.set('busca', busca);
    if (sort_by) params.set('sort_by', sort_by);
    if (order) params.set('order', order);
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    const query = params.toString();
    return request(`/api/produtos${query ? `?${query}` : ''}`);
  },

  listarCategorias: () => request('/api/produtos/categorias'),

  criarProduto: (produto) =>
    request('/api/produtos', { method: 'POST', body: JSON.stringify(produto) }),

  atualizarProduto: (id, dados) =>
    request(`/api/produtos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),

  venderProduto: (id, quantidade_vendida) =>
    request(`/api/produtos/${id}/venda`, {
      method: 'POST',
      body: JSON.stringify({ quantidade_vendida }),
    }),

  recalcularPrecos: () => request('/api/produtos/recalcular', { method: 'POST' }),

  removerProduto: (id) => request(`/api/produtos/${id}`, { method: 'DELETE' }),

  logout: () => request('/api/auth/logout', { method: 'POST' }),

  cotacao: () => request('/api/cotacao'),

  exportarCSV: (lojaId) => requestBlob(`/api/produtos/exportar${lojaId ? `?loja_id=${lojaId}` : ''}`),

  importarProdutos: (produtos) =>
    request('/api/produtos/importar', { method: 'POST', body: JSON.stringify({ produtos }) }),

  compararProdutos: () => request('/api/produtos/comparar'),

  relatorios: () => request('/api/produtos/relatorios'),

  atualizarPerfil: (nome) =>
    request('/api/auth/perfil', { method: 'PUT', body: JSON.stringify({ nome }) }),

  trocarSenha: (senha_atual, nova_senha) =>
    request('/api/auth/trocar-senha', { method: 'PUT', body: JSON.stringify({ senha_atual, nova_senha }) }),

  atualizarStatus: (id, dados) =>
    request(`/api/produtos/${id}/status`, { method: 'POST', body: JSON.stringify(dados) }),

  criarUsuario: (dados) =>
    request('/api/auth/criar-usuario', { method: 'POST', body: JSON.stringify(dados) }),

  listarUsuarios: () =>
    request('/api/auth/usuarios'),

  listarMovimentacoes: ({ tipo, loja_id, busca, data_inicio, data_fim, page, limit } = {}) => {
    const params = new URLSearchParams();
    if (tipo) params.set('tipo', tipo);
    if (loja_id) params.set('loja_id', loja_id);
    if (busca) params.set('busca', busca);
    if (data_inicio) params.set('data_inicio', data_inicio);
    if (data_fim) params.set('data_fim', data_fim);
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    const query = params.toString();
    return request(`/api/movimentacoes${query ? `?${query}` : ''}`);
  },
};
