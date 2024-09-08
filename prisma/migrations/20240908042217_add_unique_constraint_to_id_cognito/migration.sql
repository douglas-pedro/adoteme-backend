/*
  Warnings:

  - A unique constraint covering the columns `[idCognito]` on the table `UserPet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserPet_idCognito_key" ON "UserPet"("idCognito");
