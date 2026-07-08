-- Rode este script SOMENTE se você já executou o schema.sql antes desta
-- atualização (ou seja, a tabela "produtos" já existe sem as colunas novas).
-- Se está criando o banco do zero, ignore este arquivo e use só o schema.sql.

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS moeda VARCHAR(3) NOT NULL DEFAULT 'USD';
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS valor_brl NUMERIC(10,2);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE produtos ALTER COLUMN valor_usd DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'produtos_moeda_check') THEN
    ALTER TABLE produtos ADD CONSTRAINT produtos_moeda_check CHECK (moeda IN ('USD', 'BRL'));
  END IF;
END $$;

INSERT INTO lojas (nome) VALUES ('Litoral e Games') ON CONFLICT DO NOTHING;
