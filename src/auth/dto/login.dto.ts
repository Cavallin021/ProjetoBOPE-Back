import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Formato de email inválido' })
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password!: string;
}