import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClientProfession } from './create-client.dto';

export class FilterClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  income?: string;

  @IsOptional()
  @IsEnum(ClientProfession)
  profession?: string;

  @IsOptional()
  @IsString()
  date?: string;
}