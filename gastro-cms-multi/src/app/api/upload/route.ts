import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getTenantOrThrow } from '@/lib/tenant';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';

async function handlePOST(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenantOrThrow();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'logo' oder 'favicon'

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    if (!type || !['logo', 'favicon'].includes(type)) {
      return NextResponse.json(
        { error: 'Ungültiger Dateityp' },
        { status: 400 }
      );
    }

    // Erlaubte Dateitypen
    const allowedTypes = {
      logo: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'],
      favicon: ['image/x-icon', 'image/png', 'image/svg+xml']
    };

    if (!allowedTypes[type as keyof typeof allowedTypes].includes(file.type)) {
      return NextResponse.json(
        { error: `Ungültiger Dateityp. Erlaubt: ${allowedTypes[type as keyof typeof allowedTypes].join(', ')}` },
        { status: 400 }
      );
    }

    // Dateigröße prüfen (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Datei zu groß. Maximum: 5MB' },
        { status: 400 }
      );
    }

    // Upload-Verzeichnis erstellen
    const uploadDir = join(process.cwd(), 'public', 'uploads', tenant.id);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Eindeutigen Dateinamen generieren
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Datei speichern
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Relative URL zurückgeben - domain-agnostisch
    const fileUrl = `/uploads/${tenant.id}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      message: `${type === 'logo' ? 'Logo' : 'Favicon'} erfolgreich hochgeladen`
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Detailliertere Fehlermeldung
    let errorMessage = 'Fehler beim Hochladen der Datei';
    if (error instanceof Error) {
      if (error.message.includes('ENOSPC')) {
        errorMessage = 'Kein Speicherplatz verfügbar';
      } else if (error.message.includes('EACCES')) {
        errorMessage = 'Keine Schreibberechtigung';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export const POST = createProtectedHandler(
  { ...AUTH_CONFIGS.AUTHENTICATED },
  handlePOST
);
