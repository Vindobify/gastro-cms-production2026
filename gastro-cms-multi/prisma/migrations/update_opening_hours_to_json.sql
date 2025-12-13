-- Migration: Update openingHours to openingHoursData as JSON
-- This migration converts the old openingHours string field to openingHoursData JSON field

-- Add the new column
ALTER TABLE "restaurant_settings" ADD COLUMN "openingHoursData" JSONB;

-- Migrate existing data from openingHours to openingHoursData
-- Convert the old JSON string to proper JSONB
UPDATE "restaurant_settings" 
SET "openingHoursData" = "openingHours"::JSONB 
WHERE "openingHours" IS NOT NULL AND "openingHours" != '';

-- Drop the old column
ALTER TABLE "restaurant_settings" DROP COLUMN "openingHours";
