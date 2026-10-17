/*
  Warnings:

  - The values [ANONIMIZADO] on the enum `ClientStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PROSPECCAO,QUALIFICACAO] on the enum `DealStage` will be removed. If these variants are still used in the database, this will fail.
  - The values [VENDEDOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClientStatus_new" AS ENUM ('ATIVO', 'INATIVO');
ALTER TABLE "clients" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "clients" ALTER COLUMN "status" TYPE "ClientStatus_new" USING ("status"::text::"ClientStatus_new");
ALTER TYPE "ClientStatus" RENAME TO "ClientStatus_old";
ALTER TYPE "ClientStatus_new" RENAME TO "ClientStatus";
DROP TYPE "ClientStatus_old";
ALTER TABLE "clients" ALTER COLUMN "status" SET DEFAULT 'ATIVO';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "DealStage_new" AS ENUM ('DIAGNOSTICA', 'PROPOSTA', 'NEGOCIACAO', 'GANHO', 'PERDIDO');
ALTER TABLE "deals" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "deals" ALTER COLUMN "stage" TYPE "DealStage_new" USING ("stage"::text::"DealStage_new");
ALTER TYPE "DealStage" RENAME TO "DealStage_old";
ALTER TYPE "DealStage_new" RENAME TO "DealStage";
DROP TYPE "DealStage_old";
ALTER TABLE "deals" ALTER COLUMN "stage" SET DEFAULT 'DIAGNOSTICA';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('GESTOR', 'MEMBRO');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBRO';
COMMIT;

-- AlterTable
ALTER TABLE "deals" ALTER COLUMN "stage" SET DEFAULT 'DIAGNOSTICA';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBRO';

