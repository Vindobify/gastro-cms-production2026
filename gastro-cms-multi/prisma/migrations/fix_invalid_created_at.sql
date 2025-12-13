-- Migration: Fix invalid createdAt objects in Order table
-- This migration fixes cases where createdAt is stored as an empty object {} instead of a valid date

-- First, let's see what invalid createdAt values exist
-- SELECT id, createdAt, typeof(createdAt) FROM "Order" WHERE createdAt IS NULL OR createdAt = '{}'::jsonb;

-- Update orders with invalid createdAt values
-- Set them to the current timestamp if they are NULL or invalid
UPDATE "Order" 
SET "createdAt" = NOW() 
WHERE "createdAt" IS NULL 
   OR "createdAt" = '{}'::jsonb 
   OR "createdAt" = '{}'::text
   OR "createdAt" = 'null'::text;

-- Also check for any other invalid date formats and fix them
UPDATE "Order" 
SET "createdAt" = NOW() 
WHERE "createdAt"::text = '{}' 
   OR "createdAt"::text = 'null'
   OR "createdAt"::text = '""'
   OR "createdAt"::text = '[]';

-- Verify the fix
-- SELECT id, "createdAt", "updatedAt" FROM "Order" WHERE id = 34;
