import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma } from '@prisma/client';
import { Injectable, ConflictException } from '@nestjs/common';
import { FilterClientDto } from './dto/filter-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
      // busca no banco se ja existe um cliente c o nome 
    const clientExists = await this.prisma.client.findFirst({
      where: { name: createClientDto.name },
    });

    //se encontrar apresenta o exceção 
    if (clientExists) {
      throw new ConflictException('Já existe um cliente cadastrado com este nome.');
    }

    // se nao encontar criar normal mesmo 
    return await this.prisma.client.create({
      data: createClientDto,
    });
  }


  findAll(filters: FilterClientDto) {
    const { name, location, income, profession, date, status } = filters;
    const where: Prisma.ClientWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (income) {
      if (income.includes('-')) {
        const [min, max] = income.split('-');
       
        where.income = {
          gte: Number(min), 
          lte: Number(max),
        };
      } else {
        // converte para numero se for um valor exato "income=1000"
        where.income = Number(income); 
      }
    }

    if (profession) {
      where.profession = profession;
    }

    if (date) {
      const parts = date.split(/[-/]/);
      let month: number;
      let year: number;

      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
      } else {
        month = parseInt(parts[0], 10);
        year = parseInt(parts[1], 10);
      }

      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 1));

        where.createdAt = {
          gte: startDate,
          lt: endDate,
        };
      }
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.client.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.client.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    return await this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.client.delete({
      where: { id },
    });
  }
}