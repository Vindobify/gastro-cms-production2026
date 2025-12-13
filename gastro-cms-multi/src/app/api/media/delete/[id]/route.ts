import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTenantOrThrow } from '@/lib/tenant';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';
import fs from 'fs/promises';
import path from 'path';

async function handleDELETE(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await getTenantOrThrow();
    const id = parseInt(params.id);

    // Get asset details before deletion
    const asset = await prisma.asset.findUnique({
      where: { id, tenantId: tenant.id },
      include: {
        variants: true,
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Datei nicht gefunden' },
        { status: 404 }
      );
    }

    // Delete physical files
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Delete main file
      const mainFilePath = path.join(uploadsDir, asset.storedPath);
      await fs.unlink(mainFilePath).catch(() => {}); // Ignore if file doesn't exist
      
      // Delete variants
      for (const variant of asset.variants) {
        const variantFilePath = path.join(uploadsDir, variant.storedPath);
        await fs.unlink(variantFilePath).catch(() => {}); // Ignore if file doesn't exist
      }
    } catch (error) {
      console.error('Error deleting physical files:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database (variants will be deleted due to cascade)
    await prisma.asset.delete({
      where: { id, tenantId: tenant.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Datei' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  (request as any).params = context.params;
  const protectedHandler = createProtectedHandler(
    { ...AUTH_CONFIGS.AUTHENTICATED },
    (req) => handleDELETE(req, { params: (req as any).params })
  );
  return protectedHandler(request as any);
}
