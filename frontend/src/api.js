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

  removerProduto: (id) => request(`/api/produtos/${id}`, { method: 'DELETE' }),

  logout: () => request('/api/auth/logout', { method: 'POST' }),

  cotacao: () => request('/api/cotacao'),
};
