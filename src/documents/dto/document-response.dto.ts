import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

// classes usadas só para descrever as respostas no Swagger

export class DocumentResponseDto {
  @ApiProperty({ format: 'uuid', example: '4f354cc9-691f-4326-8e93-e54f7b55175a' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: '203cf22a-ca3e-4564-9914-ce4b87427cc5' })
  clientId!: string;

  @ApiProperty({ enum: DocumentType, enumName: 'DocumentType', example: DocumentType.PROPOSTA })
  type!: DocumentType;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Nome original do arquivo enviado',
    example: 'Proposta Comercial.pdf',
  })
  fileName!: string | null;

  @ApiProperty({ example: '2026-11-04T14:16:03.438Z' })
  createdAt!: Date;
}

export class LogUserDto {
  @ApiProperty({ format: 'uuid', example: 'f6850026-8e20-416e-98b8-b7b222a78cd4' })
  id!: string;

  @ApiProperty({ example: 'Gabriel' })
  username!: string;
}

export class ProposalLogResponseDto {
  @ApiProperty({ format: 'uuid', example: 'ea130989-9c93-4c86-8c55-c141941c42a7' })
  id!: string;

  @ApiProperty({
    description:
      'Ação seguida do nome do arquivo. Valores possíveis: PROPOSTA_ENVIADA ou PROPOSTA_REMOVIDA',
    example: 'PROPOSTA_ENVIADA: Proposta Comercial.pdf',
  })
  action!: string;

  @ApiProperty({ example: '2026-11-04T14:16:03.443Z' })
  timestamp!: Date;

  @ApiProperty({ type: LogUserDto, description: 'Usuário que enviou ou removeu a proposta' })
  user!: LogUserDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Documento removido com sucesso.' })
  message!: string;
}
