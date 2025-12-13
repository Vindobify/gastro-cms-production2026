import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AUTH_CONFIGS } from '@/lib/apiAuth';
import { generateCategorySlug } from '@/lib/slugify';
import { getTenant, getTenantOrThrow } from '@/lib/tenant';

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    let where: any = {
      isActive: true,
      tenantId: tenant.id // Filter Tenants
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kategorien' },
      { status: 500 }
    );
  }
}

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image, icon, isActive = true } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }

    const tenant = await getTenantOrThrow(); // POST needs mandatory tenant

    // Generate unique slug
    const existingCategories = await prisma.category.findMany({
      where: { tenantId: tenant.id },
      select: { slug: true } as any
    });
    const existingSlugs = existingCategories.map((cat: any) => cat.slug);
    const slug = generateCategorySlug(name, existingSlugs);

    // Get the highest sortOrder and add 1
    const lastCategory = await prisma.category.findFirst({
      where: { tenantId: tenant.id },
      orderBy: { sortOrder: 'desc' }
    });
    const sortOrder = (lastCategory?.sortOrder || 0) + 1;

    const category = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        name,
        slug,
        description,
        image,
        icon,
        sortOrder,
        isActive
      } as any
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Kategorie' },
      { status: 500 }
    );
  }
}

// Export handlers - Public read access, Admin/Manager write access
export const GET = createProtectedHandler(AUTH_CONFIGS.PUBLIC_READ, handleGET);
export const POST = createProtectedHandler(AUTH_CONFIGS.ADMIN_MANAGER, handlePOST);
