import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import produtosRoutes from './routes/produtos.js';
import lojasRoutes from './routes/lojas.js';
import cotacaoRoutes from './routes/cotacao.js';

const app = express();

// Aceita uma ou mais origens (separadas por vírgula) e ignora barra final,
// maiúsculas/minúsculas e espaços acidentais na variável de ambiente.
const origensPermitidas = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Requisições sem origin (ex: curl, health checks) sempre passam
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Origens permitidas (CORS): ${origensPermitidas.join(', ') || '(nenhuma configurada — bloqueando tudo com origin)'}`);
});
