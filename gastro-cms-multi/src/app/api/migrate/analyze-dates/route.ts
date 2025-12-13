import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Analyzing all createdAt values...');

    // Get all orders with their createdAt values
    const allOrders = await prisma.$queryRaw<Array<{
      id: number;
      createdAt: Date | null;
      created_at_text: string;
      updatedAt: Date;
    }>>`
      SELECT id, "createdAt", "createdAt"::text as created_at_text, "updatedAt"
      FROM "Order" 
      ORDER BY id
    `;

    // Analyze the data
    const analysis = {
      totalOrders: allOrders.length,
      validDates: 0,
      invalidDates: 0,
      nullDates: 0,
      emptyObjectDates: 0,
      stringDates: 0,
      otherInvalidDates: 0,
      problematicOrders: [] as any[]
    };

    allOrders.forEach((order) => {
      const createdAtText = order.created_at_text;
      
      if (!order.createdAt) {
        analysis.nullDates++;
        analysis.problematicOrders.push({
          id: order.id,
          issue: 'NULL createdAt',
          value: order.createdAt,
          textValue: createdAtText
        });
      } else if (createdAtText === '{}' || createdAtText === 'null' || createdAtText === '""' || 
                 createdAtText === '[]' || createdAtText === 'undefined' || 
                 createdAtText === 'false' || createdAtText === 'true') {
        analysis.invalidDates++;
        analysis.problematicOrders.push({
          id: order.id,
          issue: 'Invalid createdAt format',
          value: order.createdAt,
          textValue: createdAtText
        });
      } else {
        // createdAt is a valid Date object
        analysis.validDates++;
      }
    });

    return NextResponse.json({
      success: true,
      analysis,
      sampleOrders: allOrders.slice(0, 10) // First 10 orders as sample
    });

  } catch (error) {
    console.error('Error analyzing dates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze dates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
