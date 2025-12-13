import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('Starting migration to fix invalid createdAt values...');

    // First, let's check what invalid createdAt values exist
    const invalidOrders = await prisma.$queryRaw`
      SELECT id, "createdAt", "createdAt"::text as created_at_text
      FROM "Order" 
      WHERE "createdAt" IS NULL 
         OR "createdAt"::text = '{}' 
         OR "createdAt"::text = 'null'
         OR "createdAt"::text = '""'
         OR "createdAt"::text = '[]'
         OR "createdAt"::text = '{}'::text
         OR "createdAt"::text = 'null'::text
         OR "createdAt"::text = 'undefined'
         OR "createdAt"::text = 'false'
         OR "createdAt"::text = 'true'
    `;

    console.log('Found invalid createdAt values:', invalidOrders);

    // Fix invalid createdAt values
    const result = await prisma.$executeRaw`
      UPDATE "Order" 
      SET "createdAt" = NOW() 
      WHERE "createdAt" IS NULL 
         OR "createdAt"::text = '{}' 
         OR "createdAt"::text = 'null'
         OR "createdAt"::text = '""'
         OR "createdAt"::text = '[]'
         OR "createdAt"::text = '{}'::text
         OR "createdAt"::text = 'null'::text
         OR "createdAt"::text = 'undefined'
         OR "createdAt"::text = 'false'
         OR "createdAt"::text = 'true'
    `;

    console.log(`Fixed ${result} orders with invalid createdAt values`);

    // Verify the fix for order 34 specifically
    const order34 = await prisma.order.findUnique({
      where: { id: 34 },
      select: { id: true, createdAt: true, updatedAt: true }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully fixed ${result} orders with invalid createdAt values`,
      fixedOrders: result,
      order34: order34
    });

  } catch (error) {
    console.error('Error fixing createdAt values:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fix createdAt values',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
