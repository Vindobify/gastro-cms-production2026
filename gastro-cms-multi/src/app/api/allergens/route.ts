import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler } from '@/lib/apiAuth';

import { STANDARD_ALLERGENS } from '@/lib/constants';

async function handleGET() {
  try {
    return NextResponse.json({
      allergens: STANDARD_ALLERGENS,
      total: STANDARD_ALLERGENS.length
    });
  } catch (error) {
    console.error('Fehler beim Laden der Allergene:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Allergene' },
      { status: 500 }
    );
  }
}

// Export protected handler - Admin/Manager access
export const GET = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handleGET);
