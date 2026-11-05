import { IsEmail, IsNotEmpty, IsEnum, IsBoolean, IsOptional, MinLength, IsString, Matches } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Formato de email inválido' })
  @Matches(/@cjr\.org\.br$/, { message: 'Acesso restrito: utilize seu email corporativo da CJR' })  
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEnum(Role, { message: 'Nível de acesso deve ser GESTOR ou MEMBRO' })
  @IsOptional()
  role?: Role;

  @IsBoolean({ message: 'isBopePrimario deve ser um booleano' })
  @IsNotEmpty()
  isBopePrimario!: boolean;

  @IsBoolean()
  @IsOptional()
  isBopeSecundario?: boolean;

  @IsBoolean()
  @IsOptional()
  isGuardiaoNdp?: boolean;
}