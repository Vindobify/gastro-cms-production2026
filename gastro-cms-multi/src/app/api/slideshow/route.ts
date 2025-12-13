import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';
import { getTenantOrThrow } from '@/lib/tenant';

async function handleGET(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenantOrThrow();
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    
    let where: any = {};
    
    if (active === 'true') {
      const now = new Date();
      where = {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      };
    }

    const slideshows = await prisma.slideshow.findMany({
      where: { ...where, tenantId: tenant.id },
      include: {
        slideshowItems: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(slideshows);
  } catch (error) {
    console.error('Error fetching slideshows:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Slideshows' },
      { status: 500 }
    );
  }
}

async function handlePOST(request: AuthenticatedRequest) {
  try {
    const tenant = await getTenantOrThrow();
    const body = await request.json();
    const {
      title,
      description,
      backgroundImage,
      headline,
      subheadline,
      buttonText,
      buttonLink,
      startDate,
      endDate,
      slideshowItems
    } = body;

    const slideshow = await prisma.slideshow.create({
      data: {
        tenantId: tenant.id,
        title,
        description,
        backgroundImage,
        headline,
        subheadline,
        buttonText,
        buttonLink,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        slideshowItems: {
          create: slideshowItems?.map((item: any) => ({
            itemType: item.itemType,
            itemId: item.itemId,
            title: item.title,
            description: item.description,
            image: item.image,
            sortOrder: item.sortOrder || 0
          })) || []
        }
      },
      include: {
        slideshowItems: true
      }
    });

    return NextResponse.json(slideshow);
  } catch (error) {
    console.error('Error creating slideshow:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Slideshow' },
      { status: 500 }
    );
  }
}

export const GET = createProtectedHandler(AUTH_CONFIGS.PUBLIC_READ, handleGET);
export const POST = createProtectedHandler(AUTH_CONFIGS.ADMIN_MANAGER, handlePOST);
