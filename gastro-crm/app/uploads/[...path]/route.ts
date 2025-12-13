import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;
    // Reconstruct the file path from the dynamic route
    const filePath = pathParams.path.join('/');
    const fullPath = join(process.cwd(), 'public', 'uploads', filePath);

    // Security check: ensure the path is within the uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const resolvedPath = join(uploadsDir, filePath);
    
    if (!resolvedPath.startsWith(uploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if file exists
    if (!existsSync(fullPath)) {
      console.log(`File not found: ${fullPath}`);
      console.log(`Requested path: ${filePath}`);
      console.log(`Resolved path: ${resolvedPath}`);
      console.log(`Uploads dir: ${uploadsDir}`);
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);
    
    // Determine content type based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'ico':
        contentType = 'image/x-icon';
        break;
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
        'Access-Control-Allow-Origin': '*', // Allow access from landing page
      },
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

