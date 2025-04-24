/*
  Warnings:

  - You are about to drop the `_categorytocourt` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_categorytocourt` DROP FOREIGN KEY `_CategoryToCourt_A_fkey`;

-- DropForeignKey
ALTER TABLE `_categorytocourt` DROP FOREIGN KEY `_CategoryToCourt_B_fkey`;

-- DropForeignKey
ALTER TABLE `log` DROP FOREIGN KEY `Log_userId_fkey`;

-- DropIndex
DROP INDEX `Log_userId_fkey` ON `log`;

-- AlterTable
ALTER TABLE `log` MODIFY `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `description` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_categorytocourt`;

-- CreateTable
CREATE TABLE `_CategoriaCourts` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CategoriaCourts_AB_unique`(`A`, `B`),
    INDEX `_CategoriaCourts_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaCourts` ADD CONSTRAINT `_CategoriaCourts_A_fkey` FOREIGN KEY (`A`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaCourts` ADD CONSTRAINT `_CategoriaCourts_B_fkey` FOREIGN KEY (`B`) REFERENCES `Court`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
