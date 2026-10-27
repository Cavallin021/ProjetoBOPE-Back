BEGIN;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "DocumentType" AS ENUM ('PROPOSTA', 'CONTRATO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- DropForeignKey
ALTER TABLE "deals" DROP CONSTRAINT IF EXISTS "deals_ownerId_fkey";

-- AlterTable audit_logs
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "targetDealId" TEXT;

-- AlterTable clients (convert income to DOUBLE PRECISION NOT NULL, coalescing NULL/invalid to 0)
ALTER TABLE "clients"
ALTER COLUMN "income" TYPE DOUBLE PRECISION
USING (
  CASE
    WHEN "income" IS NULL THEN 0
    WHEN "income"::text ~ '^[0-9]+(\.[0-9]+)?$' THEN ("income"::text)::DOUBLE PRECISION
    ELSE 0
  END
);
UPDATE "clients" SET "income" = 0 WHERE "income" IS NULL;
ALTER TABLE "clients" ALTER COLUMN "income" SET NOT NULL;

-- AlterTable deals
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'deals' AND column_name = 'ownerId'
    ) THEN
        ALTER TABLE "deals" RENAME COLUMN "ownerId" TO "bope1Id";
    END IF;
END $$;

ALTER TABLE "deals"
ADD COLUMN IF NOT EXISTS "bope1Id" TEXT,
ADD COLUMN IF NOT EXISTS "bope2Id" TEXT,
ADD COLUMN IF NOT EXISTS "guardiaoNdpId" TEXT,
ADD COLUMN IF NOT EXISTS "leadType" TEXT;

-- CreateTable client_documents
CREATE TABLE IF NOT EXISTS "client_documents" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "client_documents" DROP CONSTRAINT IF EXISTS "client_documents_clientId_fkey";
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "deals" DROP CONSTRAINT IF EXISTS "deals_bope1Id_fkey";
ALTER TABLE "deals" ADD CONSTRAINT "deals_bope1Id_fkey" FOREIGN KEY ("bope1Id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "deals" DROP CONSTRAINT IF EXISTS "deals_bope2Id_fkey";
ALTER TABLE "deals" ADD CONSTRAINT "deals_bope2Id_fkey" FOREIGN KEY ("bope2Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "deals" DROP CONSTRAINT IF EXISTS "deals_guardiaoNdpId_fkey";
ALTER TABLE "deals" ADD CONSTRAINT "deals_guardiaoNdpId_fkey" FOREIGN KEY ("guardiaoNdpId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_targetDealId_fkey";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_targetDealId_fkey" FOREIGN KEY ("targetDealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
