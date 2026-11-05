export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// mime aceito -> extensão usada ao salvar no disco
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

// caminho inverso, usado no download (o banco guarda só o caminho do arquivo)
export const MIME_TYPE_BY_EXTENSION: Record<string, string> = Object.fromEntries(
  Object.entries(ALLOWED_MIME_TYPES).map(([mimeType, extension]) => [extension, mimeType]),
);

// ações gravadas no audit_logs, seguidas de ": <nome do arquivo>"
export const DOCUMENT_ACTIONS = {
  PROPOSTA: { enviado: 'PROPOSTA_ENVIADA', removido: 'PROPOSTA_REMOVIDA' },
  CONTRATO: { enviado: 'CONTRATO_ENVIADO', removido: 'CONTRATO_REMOVIDO' },
} as const;
