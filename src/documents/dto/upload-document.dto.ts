import { IsEnum } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @IsEnum(DocumentType, { message: 'O tipo deve ser PROPOSTA ou CONTRATO' })
  type!: DocumentType;
}
