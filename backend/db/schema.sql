-- Tabela de lojas
CREATE TABLE IF NOT EXISTS lojas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela de usuários
-- role: 'admin' (vê tudo) ou 'gerente' (vê só a loja_id dele)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'gerente',
  loja_id INTEGER REFERENCES lojas(id)
);

-- Tabela de produtos / estoque
-- moeda: 'USD' (converte pela cotação do dia) ou 'BRL' (preço já fixo em reais)
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  loja_id INTEGER NOT NULL REFERENCES lojas(id),
  moeda VARCHAR(3) NOT NULL DEFAULT 'USD' CHECK (moeda IN ('USD', 'BRL')),
  valor_usd NUMERIC(10,2) CHECK (valor_usd IS NULL OR valor_usd > 0),
  valor_brl NUMERIC(10,2) CHECK (valor_brl IS NULL OR valor_brl > 0),
  quantidade INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  categoria VARCHAR(50),
  cor VARCHAR(50),
  observacao TEXT,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Cache da cotação do dólar (1 registro por dia)
CREATE TABLE IF NOT EXISTS cotacao_cache (
  id SERIAL PRIMARY KEY,
  valor NUMERIC(10,4) NOT NULL,
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tokens para redefinição de senha
CREATE TABLE IF NOT EXISTS reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expira_em TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '1 hour'
);

-- Lojas iniciais
INSERT INTO lojas (nome) VALUES ('Central de Estoque'), ('Loja Games'), ('Loja Litoral')
  ON CONFLICT (nome) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_loja_id ON produtos(loja_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON reset_tokens(token);
