-- Migration: Add taxRate field to OrderItem table
-- This migration adds the taxRate field to store the tax rate at the time of order

-- Add taxRate column to order_items table
ALTER TABLE "order_items" ADD COLUMN "taxRate" DECIMAL(3,2) DEFAULT 0.20;

-- Update existing order items with default tax rate (20%)
UPDATE "order_items" SET "taxRate" = 0.20 WHERE "taxRate" IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE "order_items" ALTER COLUMN "taxRate" SET NOT NULL;
