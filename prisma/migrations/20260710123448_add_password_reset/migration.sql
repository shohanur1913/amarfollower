-- Add password reset fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_expires" TIMESTAMPTZ;

-- Add password reset fields to admins table
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "reset_token" TEXT;
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "reset_expires" TIMESTAMPTZ;
