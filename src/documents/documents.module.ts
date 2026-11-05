import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { StorageService } from './storage.service';
import { LocalStorageService } from './local-storage.service';
import { DriveStorageService } from './drive-storage.service';

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    {
      provide: StorageService,
      // disco local por padrão; "drive" usa o Drive compartilhado configurado no .env
      useFactory: () => {
        const driver = process.env.STORAGE_DRIVER || 'local';
        if (driver === 'local') return new LocalStorageService();
        if (driver === 'drive') return new DriveStorageService();
        throw new Error(`STORAGE_DRIVER inválido: "${driver}". Use "local" ou "drive".`);
      },
    },
  ],
})
export class DocumentsModule {}
