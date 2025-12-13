import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireApiKey, ApiKeyAuth } from '@/lib/apiAuth';

async function handleGET(
  request: NextRequest,
  auth: ApiKeyAuth,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const restaurant = await prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        domain: true,
        subdomain: true,
        email: true,
        phone: true,
        isActive: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
        settings: {
          select: {
            restaurantName: true,
            address: true,
            city: true,
            postalCode: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden des Restaurants' },
      { status: 500 }
    );
  }
}

// Wrapper to handle params
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await require('@/lib/apiAuth').verifyApiKey(request);
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return handleGET(request, auth, { params });
}

