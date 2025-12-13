import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler } from '@/lib/apiAuth';
import { prisma } from '@/lib/database';

async function handleGET(request: NextRequest) {
  try {
    const dbUsers = await prisma.apiUser.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { apiKeys: true }
        }
      }
    });

    const formattedUsers = dbUsers.map((user) => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      company: user.company,
      description: user.description,
      isActive: user.isActive,
      apiKeysCount: user._count.apiKeys,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length
    });
  } catch (error) {
    console.error('Error fetching external users:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der externen Benutzer' },
      { status: 500 }
    );
  }
}

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, description } = body;

    // Validierung
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name und E-Mail sind erforderlich' },
        { status: 400 }
      );
    }

    // Prüfen ob E-Mail bereits existiert
    const existingUser = await prisma.apiUser.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ein Benutzer mit dieser E-Mail existiert bereits' },
        { status: 409 }
      );
    }

    // Neuen Benutzer in der Datenbank erstellen
    const newUser = await prisma.apiUser.create({
      data: {
        name,
        email,
        company: company || null,
        description: description || null,
        isActive: true
      }
    });

    const formattedUser = {
      id: newUser.id.toString(),
      name: newUser.name,
      email: newUser.email,
      company: newUser.company,
      description: newUser.description,
      isActive: newUser.isActive,
      apiKeysCount: 0,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error) {
    console.error('Error creating external user:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des externen Benutzers' },
      { status: 500 }
    );
  }
}

// Export protected handlers - Admin only access
export const GET = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN']
}, handleGET);

export const POST = createProtectedHandler({
  requireAuth: true,
  allowedRoles: ['ADMIN']
}, handlePOST);
