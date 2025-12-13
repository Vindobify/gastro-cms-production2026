import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler } from '@/lib/apiAuth';

async function handlePOST(request: NextRequest) {
  try {
    // Clear all category icons
    const result = await prisma.category.updateMany({
      data: { icon: null }
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} category icons cleared`,
      clearedCount: result.count
    });

  } catch (error) {
    console.error('Error clearing category icons:', error);
    return NextResponse.json(
      { error: 'Failed to clear category icons' },
      { status: 500 }
    );
  }
}

export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handlePOST);
