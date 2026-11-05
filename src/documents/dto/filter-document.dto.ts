import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class FilterDocumentDto {
  @ApiPropertyOptional({
    enum: DocumentType,
    enumName: 'DocumentType',
    description: 'Filtra pelo tipo',
  })
  @IsOptional()
  @IsEnum(DocumentType, { message: 'O tipo deve ser PROPOSTA ou CONTRATO' })
  type?: DocumentType;
}
