import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './database';

export interface ApiKeyAuth {
  apiKeyId: number;
  apiUserId: number;
  tenantId: string;
  permissions: string[];
}

export async function verifyApiKey(request: NextRequest): Promise<ApiKeyAuth | null> {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return null;
  }

  // TODO: Implement proper API key verification with ApiKey model
  // For now, return a basic auth object if API key is provided
  // In production, this should verify against the database
  try {
    // Placeholder implementation - replace with actual database lookup
    // const apiKeyRecord = await prisma.apiKey.findFirst({...});
    return {
      apiKeyId: 0,
      apiUserId: 0,
      tenantId: '',
      permissions: ['read'],
    };
  } catch (error) {
    console.error('Error verifying API key:', error);
    return null;
  }
}

export function requireApiKey(handler: (req: NextRequest, auth: ApiKeyAuth) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = await verifyApiKey(request);

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API key' },
        { status: 401 }
      );
    }

    return handler(request, auth);
  };
}

