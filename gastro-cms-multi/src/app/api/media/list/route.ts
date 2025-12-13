import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTenantOrThrow } from '@/lib/tenant';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';

async function handleGET(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenantOrThrow();
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    
    // Build where clause for folder filtering
    const whereClause: any = {
      isActive: true,
      tenantId: tenant.id
    };
    
    if (folderId) {
      whereClause.folderId = parseInt(folderId);
    } else {
      whereClause.folderId = null; // Root level assets
    }

    // Get assets from database
    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        variants: true,
        folder: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform assets to match expected format
    const transformedAssets = assets.map(asset => ({
      id: asset.id,
      storedPath: asset.storedPath,
      originalName: asset.originalName,
      mime: asset.mime, // Geändert von mimeType zu mime
      size: asset.size,
      url: `/uploads/${asset.storedPath}`,
      alt: asset.alt,
      title: asset.title,
      description: asset.description,
      folderId: asset.folderId,
      createdAt: asset.createdAt.toISOString(),
      variants: asset.variants.map(variant => ({
        id: variant.id,
        storedPath: variant.storedPath,
        width: variant.width,
        height: variant.height,
        size: variant.size,
        url: `/uploads/${variant.storedPath}`
      }))
    }));

    return NextResponse.json({ assets: transformedAssets });
  } catch (error) {
    console.error('Error loading media files:', error);
    return NextResponse.json({ assets: [] });
  }
}

export const GET = createProtectedHandler(
  { ...AUTH_CONFIGS.AUTHENTICATED },
  handleGET
);
