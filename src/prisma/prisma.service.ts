import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to PostgreSQL database successfully.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}