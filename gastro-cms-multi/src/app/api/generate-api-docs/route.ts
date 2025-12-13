import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler } from '@/lib/apiAuth';
import { saveApiDocumentationPDF } from '@/lib/pdfGenerator';
import { prisma } from '@/lib/database';

type BodyShape = {
  apiKey?: any;
  apiUser?: any;
  domain?: string;
};

async function handlePOST(request: NextRequest) {
  let body: BodyShape = {};
  try {
    body = await request.json() as BodyShape;

    // API Key und User direkt aus Request Body verwenden
    const apiKey = body.apiKey;
    const apiUser = body.apiUser;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key nicht gefunden' },
        { status: 404 }
      );
    }

    if (!apiUser) {
      return NextResponse.json(
        { error: 'API User nicht gefunden' },
        { status: 404 }
      );
    }

    // Domain aus Request-Header extrahieren für Multi-Domain-Kompatibilität
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const currentDomain = body.domain || `${protocol}://${host}`;

    // PDF mit vollständigen Objekten generieren
    const pdfPath = await saveApiDocumentationPDF(
      apiKey,
      apiUser,
      currentDomain
    );

    // Vollständige URL für Download erstellen
    const downloadUrl = `${currentDomain}${pdfPath}`;

    return NextResponse.json({
      success: true,
      pdfPath,
      downloadUrl
    });

  } catch (error) {
    console.error('Error generating API documentation PDF:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Request body:', JSON.stringify(body));
    return NextResponse.json(
      { error: 'Fehler beim Generieren der PDF-Dokumentation', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Export protected handler - Admin only access
export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN']
}, handlePOST);
