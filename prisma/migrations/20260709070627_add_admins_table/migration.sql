/*
  Warnings:

  - Added the required column `amount` to the `refills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "refills" ADD COLUMN     "amount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "reason" TEXT;

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "two_factor_secret" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
