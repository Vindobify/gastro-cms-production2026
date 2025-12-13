import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('Starting migration to add taxRate field to OrderItem table...');

    // Check if taxRate column already exists
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' AND column_name = 'taxRate'
    `;

    if ((tableInfo as any[]).length > 0) {
      return NextResponse.json({
        success: true,
        message: 'taxRate column already exists in order_items table',
        skipped: true
      });
    }

    // Add taxRate column
    await prisma.$executeRaw`
      ALTER TABLE "order_items" ADD COLUMN "taxRate" DECIMAL(3,2) DEFAULT 0.20
    `;

    // Update existing order items with default tax rate (20%)
    const updateResult = await prisma.$executeRaw`
      UPDATE "order_items" SET "taxRate" = 0.20 WHERE "taxRate" IS NULL
    `;

    // Make the column NOT NULL
    await prisma.$executeRaw`
      ALTER TABLE "order_items" ALTER COLUMN "taxRate" SET NOT NULL
    `;

    console.log(`Updated ${updateResult} existing order items with default tax rate`);

    return NextResponse.json({
      success: true,
      message: 'Successfully added taxRate field to OrderItem table',
      updatedItems: updateResult
    });

  } catch (error) {
    console.error('Error adding taxRate field:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add taxRate field',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
