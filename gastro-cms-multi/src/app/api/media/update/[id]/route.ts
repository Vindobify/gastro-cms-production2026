import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTenantOrThrow } from '@/lib/tenant';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';

async function handlePATCH(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  try {
    const tenant = await getTenantOrThrow();
    const body = await request.json();
    const { alt, title, description } = body;

    const updatedAsset = await prisma.asset.update({
      where: { id, tenantId: tenant.id },
      data: {
        alt: alt || null,
        title: title || null,
        description: description || null,
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Datei' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  (request as any).params = context.params;
  const protectedHandler = createProtectedHandler(
    { ...AUTH_CONFIGS.AUTHENTICATED },
    (req) => handlePATCH(req, { params: (req as any).params })
  );
  return protectedHandler(request as any);
}
