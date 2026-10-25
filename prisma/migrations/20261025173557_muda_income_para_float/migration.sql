/*
  Warnings:

  - Changed the type of `income` on the `clients` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "income",
ADD COLUMN     "income" DOUBLE PRECISION NOT NULL;
