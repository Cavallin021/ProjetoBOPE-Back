import { IsEnum, IsOptional } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class FilterDocumentDto {
  @IsOptional()
  @IsEnum(DocumentType, { message: 'O tipo deve ser PROPOSTA ou CONTRATO' })
  type?: DocumentType;
}
