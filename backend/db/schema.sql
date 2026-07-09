-- Tabela de lojas
CREATE TABLE IF NOT EXISTS lojas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL
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
  valor_usd NUMERIC(10,2),
  valor_brl NUMERIC(10,2),
  quantidade INTEGER NOT NULL DEFAULT 0,
  categoria VARCHAR(50),
  observacao TEXT,
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Cache da cotação do dólar (1 registro por dia)
CREATE TABLE IF NOT EXISTS cotacao_cache (
  id SERIAL PRIMARY KEY,
  valor NUMERIC(10,4) NOT NULL,
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Dados de exemplo
INSERT INTO lojas (nome) VALUES ('Central de Estoque'), ('Loja Games'), ('Loja Litoral')
  ON CONFLICT DO NOTHING;

-- Senha de exemplo para os dois usuários abaixo: "123456"
-- (o hash foi gerado com bcryptjs, troque as senhas reais depois de subir o app)
-- Rode o script backend/db/seed.js para criar usuários com senha à sua escolha.
