/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cliente` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `cliente` VARCHAR(191) NOT NULL,
    ADD COLUMN `codigo` VARCHAR(191) NOT NULL,
    ADD COLUMN `telefone` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_codigo_key` ON `Payment`(`codigo`);
