const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('token');
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

  listarLojas: () => request('/api/lojas'),

  listarProdutos: (lojaId, categoria) => {
    const params = new URLSearchParams();
    if (lojaId) params.set('loja_id', lojaId);
    if (categoria) params.set('categoria', categoria);
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

  cotacao: () => request('/api/cotacao'),
};
