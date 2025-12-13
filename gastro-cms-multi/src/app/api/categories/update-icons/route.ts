import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { createProtectedHandler } from '@/lib/apiAuth';

// Icon mapping based on category name patterns
const ICON_MAPPINGS = [
  { pattern: /suppe/i, icon: 'soup' },
  { pattern: /vorspeise/i, icon: 'appetizer' },
  { pattern: /salat/i, icon: 'salad' },
  { pattern: /käse/i, icon: 'cheese' },
  { pattern: /risotto/i, icon: 'rice' },
  { pattern: /crêpe/i, icon: 'dessert' },
  { pattern: /fleisch/i, icon: 'meat' },
  { pattern: /pasta/i, icon: 'pasta' },
  { pattern: /fisch/i, icon: 'fish' },
  { pattern: /pizza/i, icon: 'pizza' },
  { pattern: /burger/i, icon: 'burger' },
  { pattern: /getränk/i, icon: 'drink' },
  { pattern: /brot/i, icon: 'bread' },
  { pattern: /sandwich/i, icon: 'sandwich' },
  { pattern: /dessert/i, icon: 'dessert' },
  { pattern: /eis/i, icon: 'ice-cream' },
];

async function handlePOST(request: NextRequest) {

  try {
    // Get all categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        icon: true
      }
    });

    const updates = [];

    // Process each category that doesn't have an icon
    for (const category of categories) {
      if (!category.icon || category.icon === '') {
        const mapping = ICON_MAPPINGS.find(m => m.pattern.test(category.name));
        
        if (mapping) {
          // Update the category with the new icon
          await prisma.category.update({
            where: { id: category.id },
            data: { icon: mapping.icon }
          });
          
          updates.push({
            id: category.id,
            name: category.name,
            icon: mapping.icon
          });
        }
      }
    }

    // Get all categories with icons to show result
    const allCategoriesWithIcons = await prisma.category.findMany({
      where: {
        AND: [
          { icon: { not: null } },
          { icon: { not: '' } }
        ]
      },
      select: {
        id: true,
        name: true,
        icon: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      message: `${updates.length} categories updated with icons`,
      updates,
      totalCategoriesWithIcons: allCategoriesWithIcons.length,
      allCategoriesWithIcons
    });

  } catch (error) {
    console.error('Error updating category icons:', error);
    return NextResponse.json(
      { error: 'Failed to update category icons' },
      { status: 500 }
    );
  }
}

export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN', 'RESTAURANT_MANAGER']
}, handlePOST);
