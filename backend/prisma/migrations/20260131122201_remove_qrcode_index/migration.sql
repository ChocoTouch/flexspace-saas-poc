/*
  Warnings:

  - A unique constraint covering the columns `[qrSignature]` on the table `reservations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "reservations_qrCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "reservations_qrSignature_key" ON "reservations"("qrSignature");
