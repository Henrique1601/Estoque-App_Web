import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { asyncHandler } from '../utils/asyncHandler.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const tipos = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (!tipos.includes(file.mimetype)) {
      return cb(new Error('Formato não suportado. Use JPEG, PNG, WebP ou MP4.'));
    }
    cb(null, true);
  },
});

router.post('/', autenticar, upload.single('arquivo'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Arquivo obrigatório' });
  }

  if (!process.env.CLOUDINARY_URL) {
    return res.status(500).json({ erro: 'Upload não configurado (CLOUDINARY_URL ausente)' });
  }

  const resultado = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'estoque-app',
        resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
      },
      (err, result) => {
        if (err) reject(new Error('Erro ao fazer upload'));
        else resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });

  res.json({ url: resultado.secure_url, public_id: resultado.public_id });
}));

export default router;