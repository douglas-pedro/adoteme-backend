-- DropForeignKey
ALTER TABLE "AdoptionRequest" DROP CONSTRAINT "AdoptionRequest_requesterId_fkey";

-- AlterTable
ALTER TABLE "AdoptionRequest" ALTER COLUMN "requesterId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "UserPet"("idCognito") ON DELETE CASCADE ON UPDATE CASCADE;
