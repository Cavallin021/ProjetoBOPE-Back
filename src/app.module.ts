import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [PrismaModule, ClientsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}