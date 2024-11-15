-- CreateTable
CREATE TABLE "LikesPet" (
    "id" SERIAL NOT NULL,
    "idCognito" TEXT NOT NULL,
    "petId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikesPet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LikesPet_idCognito_petId_key" ON "LikesPet"("idCognito", "petId");

-- AddForeignKey
ALTER TABLE "LikesPet" ADD CONSTRAINT "LikesPet_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikesPet" ADD CONSTRAINT "LikesPet_idCognito_fkey" FOREIGN KEY ("idCognito") REFERENCES "UserPet"("idCognito") ON DELETE CASCADE ON UPDATE CASCADE;
