import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireApiKey, ApiKeyAuth } from '@/lib/apiAuth';

async function handleGET(request: NextRequest, auth: ApiKeyAuth) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    let where: any = {};

    // If tenantId is specified, filter by it
    if (tenantId) {
      where.id = tenantId;
    }

    const restaurants = await prisma.tenant.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: restaurants,
      count: restaurants.length,
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Restaurants' },
      { status: 500 }
    );
  }
}

export const GET = requireApiKey(handleGET);

