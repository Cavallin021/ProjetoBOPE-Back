import { IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ClientStatus } from '@prisma/client';

export const ClientProfession = [
  'Tecnologia',
  'Engenharia',
  'Saúde',
  'Educação',
  'Direito',
  'Finanças',
  'Marketing',
  'Varejo',
  'Agronegócio',
  'Indústria',
  'Serviços',
] as const;

export class CreateClientDto {
  @IsString({ message: 'O campo "name" deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo "name" é obrigatório.' })
  name!: string;

  @IsString({ message: 'O campo "profession" deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo "profession" é obrigatório.' })
  @IsIn(ClientProfession, {
    message: `O campo "profession" deve pertencer a uma das 11 áreas válidas: ${ClientProfession.join(', ')}.`,
  })
  profession!: string;

  @IsString({ message: 'O campo "income" deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo "income" é obrigatório.' })
  income!: string;

  @IsString({ message: 'O campo "location" deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo "location" é obrigatório.' })
  location!: string;

  @IsEnum(ClientStatus, {
    message: 'O campo "status" deve ser ATIVO ou INATIVO.',
  })
  @IsNotEmpty({ message: 'O campo "status" é obrigatório.' })
  status!: ClientStatus;
  
}