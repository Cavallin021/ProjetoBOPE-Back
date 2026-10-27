import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ClientsModule , ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}