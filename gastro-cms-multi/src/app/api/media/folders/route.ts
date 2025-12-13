import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTenantOrThrow } from '@/lib/tenant';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';

async function handleGET(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenantOrThrow();
    const folders = await prisma.assetFolder.findMany({
      where: { tenantId: tenant.id },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ folders: [] }, { status: 500 });
  }
}

async function handlePOST(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenantOrThrow();
    const body = await request.json();
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name ist erforderlich' }, { status: 400 });
    }

    // Optional: validate parent folder
    let resolvedParentId: number | null = null;
    if (parentId) {
      const parent = await prisma.assetFolder.findFirst({
        where: { id: parentId, tenantId: tenant.id }
      });
      if (!parent) {
        return NextResponse.json({ error: 'Übergeordneter Ordner nicht gefunden' }, { status: 404 });
      }
      resolvedParentId = parentId;
    }

    const folder = await prisma.assetFolder.create({
      data: {
        tenantId: tenant.id,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: null,
        parentId: resolvedParentId,
        sortOrder: 0,
        isActive: true
      }
    });

    return NextResponse.json({ folder });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Ordners' }, { status: 500 });
}
}

export const GET = createProtectedHandler(
  { ...AUTH_CONFIGS.AUTHENTICATED },
  handleGET
);

export const POST = createProtectedHandler(
  { ...AUTH_CONFIGS.AUTHENTICATED },
  handlePOST
);
