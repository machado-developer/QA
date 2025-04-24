/*
  Warnings:

  - Added the required column `creatorEmail` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorName` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `creatorEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `creatorName` VARCHAR(191) NOT NULL;
