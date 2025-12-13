-- Migration: Add delivery statistics table
-- Created: 2025-01-15

-- Create delivery_stats table
CREATE TABLE "delivery_stats" (
    "id" SERIAL PRIMARY KEY,
    "deliveryDriverId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryTime" INTEGER,
    "distance" DECIMAL(10,2),
    "tipAmount" DECIMAL(10,2),
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "delivery_stats_deliveryDriverId_fkey" 
        FOREIGN KEY ("deliveryDriverId") 
        REFERENCES "delivery_drivers"("id") 
        ON DELETE CASCADE,
        
    CONSTRAINT "delivery_stats_orderId_fkey" 
        FOREIGN KEY ("orderId") 
        REFERENCES "orders"("id") 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "delivery_stats_deliveryDriverId_deliveryDate_idx" 
    ON "delivery_stats"("deliveryDriverId", "deliveryDate");

CREATE INDEX "delivery_stats_deliveryDate_idx" 
    ON "delivery_stats"("deliveryDate");

-- Add unique constraint to prevent duplicate stats for same order
CREATE UNIQUE INDEX "delivery_stats_orderId_deliveryDriverId_unique" 
    ON "delivery_stats"("orderId", "deliveryDriverId");
