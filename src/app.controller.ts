import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async checkHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          database: 'disconnected',
          message: error instanceof Error ? error.message : 'Unknown database error',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}