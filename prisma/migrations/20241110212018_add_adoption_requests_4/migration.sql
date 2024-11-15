-- DropForeignKey
ALTER TABLE "AdoptionRequest" DROP CONSTRAINT "AdoptionRequest_requesterId_fkey";

-- AlterTable
ALTER TABLE "AdoptionRequest" ALTER COLUMN "requesterId" SET DATA TYPE TEXT;
