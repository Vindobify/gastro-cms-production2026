import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler, AUTH_CONFIGS, AuthenticatedRequest } from '@/lib/apiAuth';
import { normalizeDecimalFields, DECIMAL_FIELDS } from '@/lib/decimalUtils';
import { getTenant, getTenantOrThrow } from '@/lib/tenant';

async function handleGET(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const top = searchParams.get('top');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const tenant = await getTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    let where: any = { tenantId: tenant.id };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (top) {
      // Für Top-Produkte: hole Produkte mit Verkaufszahlen
      const products = await prisma.product.findMany({
        where,
        include: {
          category: true,
          orderItems: {
            select: {
              quantity: true,
              totalPrice: true
            }
          }
        },
        orderBy: {
          orderItems: {
            _count: 'desc'
          }
        },
        take: parseInt(top)
      });

      // Berechne Verkaufszahlen und Umsatz
      const productsWithStats = products.map((product: any) => {
        const totalSold = product.orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        const revenue = product.orderItems.reduce((sum: number, item: any) => sum + parseFloat((item.totalPrice || 0).toString()), 0);

        return normalizeDecimalFields({
          ...product,
          totalSold,
          revenue: Math.round(revenue * 100) / 100
        }, [...DECIMAL_FIELDS.PRODUCT, ...DECIMAL_FIELDS.EXTRA_ITEM]);
      });

      return NextResponse.json(productsWithStats);
    }

    // Normale Produktliste
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          include: {
            categoryExtras: {
              include: {
                extraGroup: {
                  include: {
                    extraItems: true
                  }
                }
              },
              orderBy: {
                extraGroup: {
                  name: 'asc'
                }
              }
            }
          }
        },
        productExtras: {
          include: {
            extraGroup: {
              include: {
                extraItems: true
              }
            }
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Normalisiere alle Produkte
    const normalizedProducts = products.map(product =>
      normalizeDecimalFields(product, [...DECIMAL_FIELDS.PRODUCT, ...DECIMAL_FIELDS.EXTRA_ITEM])
    );

    return NextResponse.json(normalizedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Produkte' },
      { status: 500 }
    );
  }
}

async function handlePOST(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { name, description, price, taxRate, categoryId, allergens } = body;

    const tenant = await getTenantOrThrow();

    // Validiere erforderliche Felder
    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }

    // Erstelle das Produkt
    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id, // Multitenant
        name,
        description: description || '',
        price: price ? parseFloat(price) : null,
        taxRate: parseFloat(taxRate) || 0.20,
        categoryId: categoryId ? parseInt(categoryId) : null,
        allergens: allergens && allergens.length > 0 ? JSON.stringify(allergens) : '[]'
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(normalizeDecimalFields(product, DECIMAL_FIELDS.PRODUCT), { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Produkts' },
      { status: 500 }
    );
  }
}

// Öffentlicher Lesezugriff für Produktkatalog, Auth für Änderungen
export const GET = createProtectedHandler(AUTH_CONFIGS.PUBLIC_READ, handleGET);
export const POST = createProtectedHandler(AUTH_CONFIGS.ADMIN_MANAGER, handlePOST);
