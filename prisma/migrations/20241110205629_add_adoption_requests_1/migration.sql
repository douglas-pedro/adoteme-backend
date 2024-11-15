/*
  Warnings:

  - Changed the type of `requesterId` on the `AdoptionRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "AdoptionRequest" DROP CONSTRAINT "AdoptionRequest_requesterId_fkey";

-- AlterTable
ALTER TABLE "AdoptionRequest" DROP COLUMN "requesterId",
ADD COLUMN     "requesterId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "UserPet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
