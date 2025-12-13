import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler } from '@/lib/apiAuth';
import {
  createApiKey,
  listApiKeys,
  deactivateApiKey,
  deleteApiKey,
  getApiKeyStats,
  PERMISSION_PRESETS
} from '@/lib/apiKeyManagement.database';

async function handleGET(request: NextRequest) {
  try {
    const keys = await listApiKeys();
    const keysWithStats = await Promise.all(keys.map(async (key: any) => ({
      ...key,
      stats: await getApiKeyStats(key.id)
    })));
    
    return NextResponse.json(keysWithStats);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der API-Schlüssel' },
      { status: 500 }
    );
  }
}

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      preset, 
      customPermissions, 
      expiresInDays, 
      requestsPerHour, 
      requestsPerDay,
      assignedUserId 
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }

    const permissions = preset === 'CUSTOM' 
      ? customPermissions 
      : PERMISSION_PRESETS[preset as keyof typeof PERMISSION_PRESETS];

    if (!permissions || permissions.length === 0) {
      return NextResponse.json(
        { error: 'Berechtigungen sind erforderlich' },
        { status: 400 }
      );
    }

    // User ID aus dem authentifizierten Request holen
    const user = (request as any).user;
    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht authentifiziert' },
        { status: 401 }
      );
    }

    const apiKey = await createApiKey(
      name,
      permissions,
      user.userId,
      {
        expiresInDays,
        requestsPerHour,
        requestsPerDay,
        assignedUserId
      }
    );

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des API-Schlüssels' },
      { status: 500 }
    );
  }
}

async function handleDELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    const action = searchParams.get('action') || 'deactivate';

    if (!keyId) {
      return NextResponse.json(
        { error: 'API-Schlüssel ID ist erforderlich' },
        { status: 400 }
      );
    }

    const user = (request as any).user;
    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht authentifiziert' },
        { status: 401 }
      );
    }

    if (action === 'delete') {
      await deleteApiKey(parseInt(keyId), user.userId);
    } else {
      await deactivateApiKey(parseInt(keyId), user.userId);
    }

    return NextResponse.json({ 
      success: true,
      action: action === 'delete' ? 'deleted' : 'deactivated'
    });
  } catch (error) {
    console.error('Error handling API key deletion:', error);
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Anfrage' },
      { status: 500 }
    );
  }
}

// Export protected handlers - Admin only access
export const GET = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN']
}, handleGET);

export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN']
}, handlePOST);

export const DELETE = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN']
}, handleDELETE);
