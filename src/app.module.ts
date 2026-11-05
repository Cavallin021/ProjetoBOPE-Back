import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [PrismaModule, UsersModule, DocumentsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}