import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, AUTH_CONFIGS } from '@/lib/apiAuth';

const notImplementedResponse = NextResponse.json(
  {
    success: false,
    error: 'Datenbank-Migrationsservice ist aktuell nicht verfügbar'
  },
  { status: 501 }
);

async function handleGET(request: NextRequest) {
  return notImplementedResponse;
}

async function handlePOST(request: NextRequest) {
  return notImplementedResponse;
}

export const GET = createProtectedHandler(
  { ...AUTH_CONFIGS.ADMIN_ONLY },
  handleGET
);

export const POST = createProtectedHandler(
  { ...AUTH_CONFIGS.ADMIN_ONLY },
  handlePOST
);