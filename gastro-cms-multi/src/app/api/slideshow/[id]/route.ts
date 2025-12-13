import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AUTH_CONFIGS } from '@/lib/apiAuth';

async function handleGET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const slideshow = await prisma.slideshow.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        slideshowItems: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!slideshow) {
      return NextResponse.json(
        { error: 'Slideshow nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(slideshow);
  } catch (error) {
    console.error('Error fetching slideshow:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Slideshow' },
      { status: 500 }
    );
  }
}

async function handlePUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const body = await request.json();
    const {
      title,
      description,
      backgroundImage,
      headline,
      subheadline,
      buttonText,
      buttonLink,
      isActive,
      sortOrder,
      startDate,
      endDate,
      slideshowItems
    } = body;

    // Lösche alle bestehenden Slideshow-Items
    await prisma.slideshowItem.deleteMany({
      where: { slideshowId: parseInt(params.id) }
    });

    const slideshow = await prisma.slideshow.update({
      where: { id: parseInt(params.id) },
      data: {
        title,
        description,
        backgroundImage,
        headline,
        subheadline,
        buttonText,
        buttonLink,
        isActive,
        sortOrder,
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
    console.error('Error updating slideshow:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Slideshow' },
      { status: 500 }
    );
  }
}

async function handleDELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    // Lösche zuerst alle Slideshow-Items
    await prisma.slideshowItem.deleteMany({
      where: { slideshowId: parseInt(params.id) }
    });

    // Lösche dann die Slideshow
    await prisma.slideshow.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slideshow:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Slideshow' },
      { status: 500 }
    );
  }
}

// Wrapper functions to handle params correctly
export const GET = (request: NextRequest, context: { params: { id: string } }) =>
  createProtectedHandler(AUTH_CONFIGS.PUBLIC_READ, (req) => handleGET(req, context))(request);

export const PUT = (request: NextRequest, context: { params: { id: string } }) =>
  createProtectedHandler(AUTH_CONFIGS.ADMIN_MANAGER, (req) => handlePUT(req, context))(request);

export const DELETE = (request: NextRequest, context: { params: { id: string } }) =>
  createProtectedHandler(AUTH_CONFIGS.ADMIN_MANAGER, (req) => handleDELETE(req, context))(request);
