const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starte Datenbank-Seeding...');

  // Admin-Benutzer erstellen
  const adminEmail = 'office@gastro-cms.at';
  const adminPassword = 'ComPaq1987!';

  // Prüfe ob Admin bereits existiert
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    // Passwort hashen
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Admin-Benutzer erstellen
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'Gastro-CMS',
            country: 'Österreich'
          }
        }
      }
    });

    console.log('✅ Admin-Benutzer erstellt:', admin.email);
  } else {
    console.log('ℹ️ Admin-Benutzer existiert bereits:', existingAdmin.email);
  }

  console.log('🎉 Seeding abgeschlossen!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding-Fehler:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
