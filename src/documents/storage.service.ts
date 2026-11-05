import { Injectable } from '@nestjs/common';
import { createReadStream, ReadStream } from 'fs';
import { mkdir, rm, stat, writeFile } from 'fs/promises';
import { dirname, resolve, sep } from 'path';

@Injectable()
export class StorageService {
  private readonly rootDir = resolve(process.env.UPLOAD_DIR || 'uploads');

  async save(relativePath: string, content: Buffer) {
    const absolutePath = this.resolvePath(relativePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
  }

  async remove(relativePath: string) {
    await rm(this.resolvePath(relativePath), { force: true });
  }

  // tamanho em bytes, ou null se o arquivo não existir no disco
  async getSize(relativePath: string) {
    try {
      return (await stat(this.resolvePath(relativePath))).size;
    } catch {
      return null;
    }
  }

  createReadStream(relativePath: string): ReadStream {
    return createReadStream(this.resolvePath(relativePath));
  }

  // impede que um caminho salvo no banco aponte para fora do diretório de uploads
  private resolvePath(relativePath: string) {
    const absolutePath = resolve(this.rootDir, relativePath);
    if (!absolutePath.startsWith(this.rootDir + sep)) {
      throw new Error(`Caminho de arquivo inválido: ${relativePath}`);
    }
    return absolutePath;
  }
}
