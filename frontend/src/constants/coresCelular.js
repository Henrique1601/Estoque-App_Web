export const CORES_CELULAR = [
  // Neutros
  'Preto', 'Branco', 'Prata', 'Cinza', 'Grafite', 'Chumbo',
  // Dourados & Rosé
  'Dourado', 'Rosa Dourado', 'Rose Gold', 'Ouro Rosé',
  // Titânio
  'Titânio Preto', 'Titânio Branco', 'Titânio Natural', 'Titânio Azul', 'Titânio Cinza',
  // Azuis
  'Azul', 'Azul Marinho', 'Azul Celeste', 'Azul Sierra', 'Azul Bebê', 'Azul Cobalto',
  // Verdes
  'Verde', 'Verde Alpino', 'Verde Meia-Noite', 'Verde Menta', 'Verde Floresta',
  // Roxos
  'Roxo', 'Lilás', 'Lavanda', 'Roxo Escuro', 'Magenta',
  // Vermelhos & Rosas
  'Vermelho', 'Product Red', 'Rosa', 'Coral', 'Rosa Choque',
  // Laranjas & Amarelos
  'Laranja', 'Amarelo', 'Pêssego', 'Âmbar',
  // Especiais
  'Meia-Noite', 'Starlight', 'Luz Estelar', 'Gelo',
  // Samsung / Google
  'Ice Blue', 'Mint', 'Navy', 'Silver Shadow', 'Pink Gold', 'Coral Red', 'Blue Black',
  'Jade Green', 'Orchid Gray', 'Burgundy',
  // Outros acabamentos
  'Fosco', 'Transparente', 'Carbono',
];

export function corToHex(cor) {
  const map = {
    'preto': '#1a1a1a', 'branco': '#f5f5f5', 'prata': '#c0c0c0',
    'cinza': '#808080', 'grafite': '#36454f', 'chumbo': '#2d2d2d',
    'dourado': '#d4af37', 'rosa dourado': '#e8bfb0', 'rose gold': '#e8bfb0',
    'ouro rosé': '#e8bfb0',
    'titânio preto': '#2c2c30', 'titânio branco': '#e8e8ec',
    'titânio natural': '#d4d0c8', 'titânio azul': '#4a6a8a', 'titânio cinza': '#7a7a80',
    'azul': '#2563eb', 'azul marinho': '#1e3a5f', 'azul celeste': '#87ceeb',
    'azul sierra': '#7ba0c7', 'azul bebê': '#b0d4f1', 'azul cobalto': '#0047ab',
    'verde': '#22c55e', 'verde alpino': '#2e6350', 'verde meia-noite': '#1a3c34',
    'verde menta': '#98ff98', 'verde floresta': '#228b22',
    'roxo': '#7c3aed', 'lilás': '#c8a2c8', 'lavanda': '#e6d5f0',
    'roxo escuro': '#4a0e4e', 'magenta': '#ff00ff',
    'vermelho': '#dc2626', 'product red': '#e63946', 'rosa': '#ec4899',
    'coral': '#ff7f50', 'rosa choque': '#ff1493',
    'laranja': '#f97316', 'amarelo': '#eab308', 'pêssego': '#ffdab9',
    'âmbar': '#ffbf00',
    'meia-noite': '#121826', 'starlight': '#f8f6f0', 'luz estelar': '#f8f6f0',
    'gelo': '#eef2f7',
    'ice blue': '#a5d8ff', 'mint': '#a3e4d7', 'navy': '#1e3a5f',
    'silver shadow': '#b4b4b4', 'pink gold': '#e8a0b0', 'coral red': '#ff4040',
    'blue black': '#1a1a2e', 'jade green': '#00a86b', 'orchid gray': '#b5a8b0',
    'burgundy': '#800020',
    'fosco': '#2a2a2a', 'transparente': '#f0f0f0', 'carbono': '#1c1c1c',
  };
  return map[cor.toLowerCase()] ?? '#888';
}
