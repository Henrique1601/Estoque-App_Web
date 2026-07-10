# Spec: Parte G — Mídia + IMEI + Observação no Cadastro

## Motivação
Ao cadastrar um novo aparelho celular, o usuário precisa registrar:
- O **IMEI** (identificador único do hardware)
- **Observações** sobre o estado físico do aparelho
- **Fotos ou vídeos** para documentar visualmente o produto

## Mudanças no banco

### `produtos`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| imei | VARCHAR(15) | opcional, CHECK (imei ~ '^\d{15}$') OU NULL |
| midia_url | TEXT | opcional, URL da imagem/vídeo após upload |

## Endpoints

### `POST /api/upload`
- Autenticado (qualquer role)
- Multipart/form-data com campo `arquivo`
- Valida tipo: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`
- Valida tamanho: max 50MB para vídeo, 10MB para imagem
- Retorna `{ url }` — caminho relativo ou URL pública

Armazenamento: (decidir entre disk local / S3 / R2 / Cloudinary)

### `PUT /api/produtos/:id`
- Aceita `imei` e `midia_url` no body (já implementado o PUT, só adicionar colunas)

## Frontend

### Modal criar produto
- Adicionar campo `imei` (type="text", maxLength=15, pattern="\d{15}")
- Adicionar campo `observacao` (textarea, igual ao editar)
- Adicionar botão "anexar mídia" que abre seletor de arquivo e faz upload

### ProdutoCard
- Exibir IMEI se presente (monospace, clicável para copiar)
- Exibir thumbnail da imagem se `midia_url` existir
- Se for vídeo, mostrar preview com ícone de play
- Ao clicar na mídia, abrir modal expandido (lightbox)

## Migração
- ADD COLUMN imei VARCHAR(15)
- ADD COLUMN midia_url TEXT
- Criar diretório `backend/uploads/` para arquivos locais
- Adicionar `express.static('/uploads')` no backend

## Não incluso (v1)
- Upload múltiplo (várias fotos por produto)
- Editar/excluir mídia separadamente
- Compactação de imagem no upload
