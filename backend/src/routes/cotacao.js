import { Router } from 'express';
import { autenticar } from '../middleware/auth.js';
import { obterCotacao, infoCotacao } from '../utils/cotacao.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(autenticar);

router.get('/', asyncHandler(async (req, res) => {
  const valor = await obterCotacao();
  const info = await infoCotacao();
  res.json({ usd_brl: valor, atualizado_em: info?.atualizado_em || null });
}));

export default router;
