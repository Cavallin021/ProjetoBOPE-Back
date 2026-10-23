import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma } from '@prisma/client';
import { FilterClientDto } from './dto/filter-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    return await this.prisma.client.create({
      data: createClientDto,
    });
  }

  
  findAll(filters: FilterClientDto) {
    const { name, location, income, profession, date } = filters;
    const where: Prisma.ClientWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (income) {
      where.income = income;
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