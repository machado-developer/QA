/*
  Warnings:

  - Added the required column `ammount` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `ammount` DECIMAL(65, 30) NOT NULL;
