import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

const prisma = new PrismaClient();

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    const { email, password, username, role, isBopePrimario, isBopeSecundario, isGuardiaoNdp } = createUserDto;

    if (isBopePrimario !== true) {
      throw new BadRequestException('A marcação BOPE-PRIMÁRIO é obrigatória.');
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new ConflictException('Este email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: role || 'MEMBRO',
        isBopePrimario,
        isBopeSecundario: isBopeSecundario ?? false,
        isGuardiaoNdp: isGuardiaoNdp ?? false,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAllForSelects() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
      },
      orderBy: {
        username: 'asc',
      },
    });
  }
}