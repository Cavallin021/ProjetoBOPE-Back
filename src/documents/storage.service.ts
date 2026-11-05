import { Readable } from 'stream';

export interface FileToStore {
  clientId: string;
  fileName: string;
  mimeType: string;
  content: Buffer;
}

export interface StoredFileInfo {
  size: number;
  mimeType: string;
}

// contrato comum dos armazenamentos; o driver é escolhido por STORAGE_DRIVER (local | drive)
export abstract class StorageService {
  // salva o arquivo e devolve a chave que vai para client_documents.fileUrl
  abstract save(file: FileToStore): Promise<string>;

  abstract remove(key: string): Promise<void>;

  // null quando o arquivo não existe mais no armazenamento
  abstract stat(key: string): Promise<StoredFileInfo | null>;

  abstract read(key: string): Promise<Readable>;
}
