import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, nome, role, loja_id }
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

// Autentica + verifica permissão em um middleware só
export function autorizar(...roles) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }
    const token = header.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = payload;
      if (!roles.includes(payload.role)) {
        return res.status(403).json({ erro: 'Sem permissão para essa ação' });
      }
      next();
    } catch {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
  };
}

// Restringe uma rota a um conjunto de roles, ex: somenteRole('admin')
export function somenteRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.role)) {
      return res.status(403).json({ erro: 'Sem permissão para essa ação' });
    }
    next();
  };
}

// Remove campos sensíveis para vendedor
export function filtrarVendedor(produto, role) {
  if (role === 'vendedor') {
    const { custo_usd, custo_brl, margem, ...resto } = produto;
    return resto;
  }
  return produto;
}
