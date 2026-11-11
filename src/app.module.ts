import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, DocumentsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
