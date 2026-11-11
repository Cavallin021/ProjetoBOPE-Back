import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { mkdir, rm, stat as statFile, writeFile } from 'fs/promises';
import { dirname, extname, resolve, sep } from 'path';
import { ALLOWED_MIME_TYPES, MIME_TYPE_BY_EXTENSION } from './documents.constants';
import { FileToStore, StorageService } from './storage.service';

// salva em disco, em UPLOAD_DIR; a chave é o caminho relativo (clients/<clientId>/<uuid>.pdf)
export class LocalStorageService extends StorageService {
  private readonly rootDir = resolve(process.env.UPLOAD_DIR || 'uploads');

  async save({ clientId, mimeType, content }: FileToStore) {
    const key = `clients/${clientId}/${randomUUID()}${ALLOWED_MIME_TYPES[mimeType]}`;
    const absolutePath = this.resolvePath(key);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
    return key;
  }

  async remove(key: string) {
    await rm(this.resolvePath(key), { force: true });
  }

  async stat(key: string) {
    try {
      const { size } = await statFile(this.resolvePath(key));
      return { size, mimeType: MIME_TYPE_BY_EXTENSION[extname(key)] ?? 'application/octet-stream' };
    } catch {
      return null;
    }
  }

  async read(key: string) {
    return createReadStream(this.resolvePath(key));
  }

  // impede que um caminho salvo no banco aponte para fora do diretório de uploads
  private resolvePath(key: string) {
    const absolutePath = resolve(this.rootDir, key);
    if (!absolutePath.startsWith(this.rootDir + sep)) {
      throw new Error(`Caminho de arquivo inválido: ${key}`);
    }
    return absolutePath;
  }
}
