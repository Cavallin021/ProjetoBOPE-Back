import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './documents.constants';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { FilterDocumentDto } from './dto/filter-document.dto';
import {
  ApiDocumentsController,
  ApiDownloadDocument,
  ApiListDocuments,
  ApiListProposalLogs,
  ApiRemoveDocument,
  ApiUploadDocument,
} from './documents.swagger';

const uploadOptions = {
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  // sem isso o multer lê o nome do arquivo como latin1 e quebra acentos
  defParamCharset: 'utf8',
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      return callback(
        new BadRequestException('Formato inválido. Envie um PDF, DOC ou DOCX.'),
        false,
      );
    }
    callback(null, true);
  },
};

// header compatível com nomes acentuados (RFC 6266 / RFC 5987)
function contentDisposition(fileName: string) {
  const asciiFallback = fileName.replace(/[^\x20-\x7e]|["\\]/g, '_');
  const encoded = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

@UseGuards(AuthGuard)
@ApiDocumentsController()
@Controller('clients/:clientId')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('documents')
  @ApiUploadDocument()
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  upload(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('O arquivo é obrigatório (campo "file").');
    }
    return this.documentsService.upload(clientId, uploadDocumentDto.type, file, user.sub);
  }

  @Get('documents')
  @ApiListDocuments()
  findAll(@Param('clientId', ParseUUIDPipe) clientId: string, @Query() filters: FilterDocumentDto) {
    return this.documentsService.findAll(clientId, filters);
  }

  @Get('documents/:documentId/download')
  @ApiDownloadDocument()
  async download(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    const file = await this.documentsService.getFile(clientId, documentId);
    return new StreamableFile(file.stream, {
      type: file.mimeType,
      disposition: contentDisposition(file.fileName),
      length: file.size,
    });
  }

  @Delete('documents/:documentId')
  @ApiRemoveDocument()
  remove(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.remove(clientId, documentId, user.sub);
  }

  @Get('proposal-logs')
  @ApiListProposalLogs()
  findProposalLogs(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.documentsService.findProposalLogs(clientId);
  }
}
