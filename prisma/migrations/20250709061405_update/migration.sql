/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Service` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "dayOfWeek",
DROP COLUMN "endTime",
DROP COLUMN "isAvailable",
DROP COLUMN "startTime",
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
