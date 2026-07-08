import { Router } from 'express';
import { autenticar } from '../middleware/auth.js';
import { obterCotacao } from '../utils/cotacao.js';

const router = Router();
router.use(autenticar);

router.get('/', async (req, res) => {
  const valor = await obterCotacao();
  res.json({ usd_brl: valor });
});

export default router;
