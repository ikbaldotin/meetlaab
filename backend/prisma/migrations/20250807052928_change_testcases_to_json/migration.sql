/*
  Warnings:

  - Changed the type of `testcases` on the `Problem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Problem" DROP COLUMN "testcases",
ADD COLUMN     "testcases" JSONB NOT NULL;
