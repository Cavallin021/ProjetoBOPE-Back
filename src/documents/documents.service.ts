import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { DOCUMENT_ACTIONS } from './documents.constants';
import { FilterDocumentDto } from './dto/filter-document.dto';

const DOCUMENT_SELECT = {
  id: true,
  clientId: true,
  type: true,
  fileName: true,
  createdAt: true,
} satisfies Prisma.ClientDocumentSelect;

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async upload(clientId: string, type: DocumentType, file: Express.Multer.File, userId: string) {
    await this.ensureClientExists(clientId);

    const fileName = file.originalname;
    const fileUrl = await this.storage.save({
      clientId,
      fileName,
      mimeType: file.mimetype,
      content: file.buffer,
    });

    try {
      // o registro no audit_logs é o log de propostas enviadas (e também guarda quem enviou contratos)
      const [document] = await this.prisma.$transaction([
        this.prisma.clientDocument.create({
          data: { clientId, type, fileUrl, fileName },
          select: DOCUMENT_SELECT,
        }),
        this.prisma.auditLog.create({
          data: {
            userId,
            targetClientId: clientId,
            action: `${DOCUMENT_ACTIONS[type].enviado}: ${fileName}`,
          },
        }),
      ]);

      return document;
    } catch (error) {
      // se o registro não foi salvo, o arquivo não pode ficar órfão no armazenamento
      await this.storage.remove(fileUrl);
      throw error;
    }
  }

  async findAll(clientId: string, filters: FilterDocumentDto) {
    await this.ensureClientExists(clientId);

    return this.prisma.clientDocument.findMany({
      where: { clientId, type: filters.type },
      select: DOCUMENT_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFile(clientId: string, documentId: string) {
    const document = await this.findDocument(clientId, documentId);

    const stored = await this.storage.stat(document.fileUrl);
    if (!stored) {
      throw new NotFoundException('Arquivo não encontrado no armazenamento.');
    }

    return {
      stream: await this.storage.read(document.fileUrl),
      fileName: document.fileName ?? `${document.type.toLowerCase()}-${document.id}`,
      mimeType: stored.mimeType,
      size: stored.size,
    };
  }

  async remove(clientId: string, documentId: string, userId: string) {
    const document = await this.findDocument(clientId, documentId);
    const fileName = document.fileName ?? document.id;

    // o documento sai do dossiê, mas a remoção fica registrada no audit_logs
    await this.prisma.$transaction([
      this.prisma.clientDocument.delete({ where: { id: document.id } }),
      this.prisma.auditLog.create({
        data: {
          userId,
          targetClientId: clientId,
          action: `${DOCUMENT_ACTIONS[document.type].removido}: ${fileName}`,
        },
      }),
    ]);

    await this.storage.remove(document.fileUrl);

    return { message: 'Documento removido com sucesso.' };
  }

  async findProposalLogs(clientId: string) {
    await this.ensureClientExists(clientId);

    return this.prisma.auditLog.findMany({
      where: {
        targetClientId: clientId,
        OR: Object.values(DOCUMENT_ACTIONS.PROPOSTA).map((action) => ({
          action: { startsWith: `${action}:` },
        })),
      },
      select: {
        id: true,
        action: true,
        timestamp: true,
        user: { select: { id: true, username: true } },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  private async findDocument(clientId: string, documentId: string) {
    const document = await this.prisma.clientDocument.findFirst({
      where: { id: documentId, clientId },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado.');
    }

    return document;
  }

  private async ensureClientExists(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado no sistema.');
    }
  }
}
