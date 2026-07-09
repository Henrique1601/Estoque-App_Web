import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { migrate } from './migrate.js';

await migrate();

import authRoutes from './routes/auth.js';
import produtosRoutes from './routes/produtos.js';
import lojasRoutes from './routes/lojas.js';
import cotacaoRoutes from './routes/cotacao.js';

const app = express();

app.use(helmet());

const origensPermitidas = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const origemLimpa = origin.trim().replace(/\/$/, '');

      if (origensPermitidas.length === 0 || origensPermitidas.includes(origemLimpa)) {
        return callback(null, true);
      }

      console.warn(`CORS bloqueou origem: "${origin}". Permitidas: ${origensPermitidas.join(', ')}`);
      return callback(new Error('Não permitido pelo CORS'));
    },
  })
);
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'API de estoque no ar' }));

app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/lojas', lojasRoutes);
app.use('/api/cotacao', cotacaoRoutes);

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.message, err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

function validarEnv() {
  const obrigatorias = ['JWT_SECRET', 'DATABASE_URL', 'FRONTEND_URL'];
  const faltando = obrigatorias.filter((v) => !process.env[v]);
  if (faltando.length > 0) {
    console.error(`Variáveis de ambiente obrigatórias faltando: ${faltando.join(', ')}`);
    process.exit(1);
  }
}
validarEnv();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Origens permitidas (CORS): ${origensPermitidas.join(', ') || '(nenhuma configurada — bloqueando tudo com origin)'}`);
});