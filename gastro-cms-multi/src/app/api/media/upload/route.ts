import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/database';
import { getTenantOrThrow } from '@/lib/tenant';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';

async function handlePOST(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenantOrThrow();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Dateityp nicht unterstützt. Erlaubt: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Datei zu groß. Maximum: 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomString}.${extension}`;

    // Create upload directory structure
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    const uploadDir = join(process.cwd(), 'public', 'uploads', year.toString(), month);
    const storedPath = `${year}/${month}/${filename}`;
    const fullPath = join(uploadDir, filename);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(fullPath, buffer);

    // Optional: validate Folder-Zugehörigkeit zum Tenant
    let resolvedFolderId: number | null = null;
    if (folderId && folderId !== 'null') {
      const parsedFolderId = parseInt(folderId);
      if (!isNaN(parsedFolderId)) {
        const folder = await prisma.assetFolder.findFirst({
          where: { id: parsedFolderId, tenantId: tenant.id }
        });
        if (!folder) {
          return NextResponse.json(
            { error: 'Ordner nicht gefunden oder gehört nicht zum Tenant' },
            { status: 404 }
          );
        }
        resolvedFolderId = parsedFolderId;
      }
    }

    // Save to database (tenant-aware)
    const asset = await prisma.asset.create({
      data: {
        tenantId: tenant.id,
        storedPath,
        originalName: file.name,
        title: file.name,
        alt: file.name,
        ext: `.${extension}`,
        mime: file.type,
        size: file.size,
        width: null,
        height: null,
        folderId: resolvedFolderId,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        storedPath: asset.storedPath,
        originalName: asset.originalName,
        mimeType: asset.mime,
        size: asset.size,
        url: `/uploads/${asset.storedPath}`,
        alt: asset.alt,
        title: asset.title,
        description: asset.description,
        folderId: asset.folderId,
        createdAt: asset.createdAt.toISOString(),
        variants: []
      },
      message: 'Datei erfolgreich hochgeladen'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei' },
      { status: 500 }
    );
  }
}

export const POST = createProtectedHandler(
  { ...AUTH_CONFIGS.AUTHENTICATED },
  handlePOST
);
