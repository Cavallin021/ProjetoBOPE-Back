import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiPayloadTooLargeResponse,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './documents.constants';
import {
  DocumentResponseDto,
  MessageResponseDto,
  ProposalLogResponseDto,
} from './dto/document-response.dto';

// documentação das rotas de documentos, separada do controller para não poluir as rotas

const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / 1024 / 1024;

const ApiClientNotFound = () =>
  ApiNotFoundResponse({ description: 'Cliente não encontrado no sistema.' });

// todas as rotas exigem o token do login; o usuário do token é quem fica registrado no audit_logs
export const ApiDocumentsController = () =>
  applyDecorators(
    ApiTags('Documentos (proposta e contrato)'),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado.' }),
    ApiParam({ name: 'clientId', format: 'uuid', description: 'Id do cliente dono do dossiê' }),
  );

export const ApiUploadDocument = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Envia uma proposta ou um contrato para o dossiê do cliente',
      description:
        `Aceita PDF, DOC ou DOCX de até ${MAX_FILE_SIZE_MB} MB. Cada envio cria um documento novo, ` +
        'mantendo as versões anteriores. O envio é registrado no audit_logs do cliente ' +
        '(PROPOSTA_ENVIADA ou CONTRATO_ENVIADO); os envios de proposta formam o log de propostas enviadas.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file', 'type'],
        properties: {
          file: { type: 'string', format: 'binary', description: 'Arquivo PDF, DOC ou DOCX' },
          type: { type: 'string', enum: Object.values(DocumentType) },
        },
      },
    }),
    ApiCreatedResponse({ type: DocumentResponseDto, description: 'Documento salvo.' }),
    ApiBadRequestResponse({ description: 'Arquivo ausente, formato não aceito ou tipo inválido.' }),
    ApiClientNotFound(),
    ApiPayloadTooLargeResponse({ description: `Arquivo maior que ${MAX_FILE_SIZE_MB} MB.` }),
  );

export const ApiListDocuments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Lista os documentos do cliente',
      description: 'Do mais recente para o mais antigo. Documentos removidos não aparecem.',
    }),
    ApiOkResponse({ type: [DocumentResponseDto] }),
    ApiBadRequestResponse({ description: 'Filtro type inválido.' }),
    ApiClientNotFound(),
  );

export const ApiDownloadDocument = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Baixa o arquivo de um documento',
      description: 'Devolve o arquivo como anexo, com o nome original.',
    }),
    ApiParam({ name: 'documentId', format: 'uuid' }),
    ApiProduces(...Object.keys(ALLOWED_MIME_TYPES)),
    ApiOkResponse({
      description: 'Conteúdo do arquivo.',
      schema: { type: 'string', format: 'binary' },
    }),
    ApiNotFoundResponse({
      description: 'Documento não encontrado ou arquivo ausente no armazenamento.',
    }),
  );

export const ApiRemoveDocument = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Remove um documento do dossiê',
      description:
        'Apaga o documento e o arquivo (no Google Drive ele vai para a lixeira). ' +
        'A remoção fica registrada no audit_logs (PROPOSTA_REMOVIDA ou CONTRATO_REMOVIDO).',
    }),
    ApiParam({ name: 'documentId', format: 'uuid' }),
    ApiOkResponse({ type: MessageResponseDto }),
    ApiNotFoundResponse({ description: 'Documento não encontrado.' }),
  );

export const ApiListProposalLogs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Log de propostas enviadas do cliente',
      description:
        'Envios e remoções de propostas, do mais recente para o mais antigo, com o usuário responsável.',
    }),
    ApiOkResponse({ type: [ProposalLogResponseDto] }),
    ApiClientNotFound(),
  );
