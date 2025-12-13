import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AuthenticatedRequest } from '@/lib/apiAuth';

async function handlePOST(request: AuthenticatedRequest) {
  try {
    // Lösche alle abgelaufenen Warenkörbe
    const result = await prisma.cart.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`Gelöschte abgelaufene Warenkörbe: ${result.count}`);

    return NextResponse.json({
      message: `${result.count} abgelaufene Warenkörbe gelöscht`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Error cleaning up expired carts:', error);
    return NextResponse.json(
      { error: 'Fehler beim Bereinigen der Warenkörbe' },
      { status: 500 }
    );
  }
}

// Nur für Admin/Manager zugänglich
export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handlePOST);
