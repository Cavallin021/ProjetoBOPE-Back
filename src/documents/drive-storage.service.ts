import { auth, drive, drive_v3 } from '@googleapis/drive';
import { Readable } from 'stream';
import { FileToStore, StorageService } from './storage.service';

// salva numa pasta de um Drive compartilhado, usando uma conta de serviço do Google Cloud;
// a chave é o id do arquivo no Drive
export class DriveStorageService extends StorageService {
  private readonly drive: drive_v3.Drive;
  private readonly folderId: string;

  constructor() {
    super();

    const { GOOGLE_DRIVE_FOLDER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } =
      process.env;
    if (!GOOGLE_DRIVE_FOLDER_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      throw new Error(
        'STORAGE_DRIVER=drive exige GOOGLE_DRIVE_FOLDER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY no .env',
      );
    }

    this.folderId = GOOGLE_DRIVE_FOLDER_ID;
    this.drive = drive({
      version: 'v3',
      auth: new auth.GoogleAuth({
        credentials: {
          client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
          // no .env a chave fica numa linha só, com as quebras escritas como \n
          private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
      }),
    });
  }

  async save({ clientId, fileName, mimeType, content }: FileToStore) {
    const { data } = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [this.folderId],
        description: `Cliente ${clientId}`,
        appProperties: { clientId },
      },
      media: { mimeType, body: Readable.from(content) },
      fields: 'id',
      supportsAllDrives: true,
    });

    if (!data.id) {
      throw new Error('O Google Drive não retornou o id do arquivo enviado.');
    }
    return data.id;
  }

  // manda para a lixeira do Drive compartilhado (recuperável por 30 dias) em vez de apagar de vez
  async remove(fileId: string) {
    try {
      await this.drive.files.update({
        fileId,
        requestBody: { trashed: true },
        supportsAllDrives: true,
      });
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }

  async stat(fileId: string) {
    try {
      const { data } = await this.drive.files.get({
        fileId,
        fields: 'size, mimeType, trashed',
        supportsAllDrives: true,
      });
      if (data.trashed) return null;

      return { size: Number(data.size), mimeType: data.mimeType ?? 'application/octet-stream' };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async read(fileId: string) {
    const { data } = await this.drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' },
    );
    return data;
  }
}

function isNotFound(error: unknown) {
  return (error as { status?: number } | null)?.status === 404;
}
