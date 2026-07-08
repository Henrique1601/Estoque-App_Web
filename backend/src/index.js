import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import produtosRoutes from './routes/produtos.js';
import lojasRoutes from './routes/lojas.js';
import cotacaoRoutes from './routes/cotacao.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'API de estoque no ar' }));

app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/lojas', lojasRoutes);
app.use('/api/cotacao', cotacaoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
