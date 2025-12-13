
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starte Multi-Tenant Datenbank-Seeding (Fix: No Slug)...');

  const password = await bcrypt.hash('password123', 10);
  const officePassword = await bcrypt.hash('ComPaq1987!', 10);

  console.log('🧹 Lösche Daten...');
  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "coupon_usages", "coupon_customers", "coupon_restrictions", "order_items", "orders", "cart_items", "carts", "delivery_stats", "delivery_driver_profiles", "delivery_drivers", "product_extras", "category_extras", "extra_items", "extra_groups", "products", "categories", "restaurant_settings", "sessions", "user_profiles", "users", "customers", "coupons", "tenants" CASCADE;`);
  } catch (e) {
    console.log('Truncate fallback...');
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  }

  // 1. CRM
  console.log('🏢 Erstelle CRM Tenant (localhost)...');
  const crmTenant = await prisma.tenant.create({
    data: {
      name: 'Gastro CMS Platform',
      // slug entfernt
      domain: 'localhost',
      subdomain: 'crm',
      isActive: true,
      email: 'admin@gastro-cms.online',
      ownerName: 'Admin'
    }
  });

  await prisma.restaurantSettings.create({
    data: {
      tenantId: crmTenant.id,
      restaurantName: 'Gastro CMS Platform',
      address: 'Tech Street 1',
      city: 'Vienna',
      postalCode: '1000',
      phone: '+43 000 000',
      email: 'admin@gastro-cms.platform',
      currency: 'EUR'
    }
  });

  await prisma.user.create({
    data: {
      tenantId: crmTenant.id,
      email: 'admin@gastro-cms.online',
      password: password,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Super',
          lastName: 'Admin'
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      tenantId: crmTenant.id,
      email: 'office@nextpuls.com',
      password: officePassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Office',
          lastName: 'Admin'
        }
      }
    }
  });

  // 2. Mario
  console.log('🍕 Erstelle Pizzeria Mario...');
  const marioTenant = await prisma.tenant.create({
    data: {
      name: 'Pizzeria Mario',
      // slug entfernt
      domain: 'pizzeria1140.local',
      subdomain: 'mario',
      isActive: true,
      email: 'mario@pizzeria.local',
      ownerName: 'Mario Rossi'
    }
  });

  await prisma.restaurantSettings.create({
    data: {
      tenantId: marioTenant.id,
      restaurantName: 'Pizzeria Mario',
      address: 'Mario Weg 1',
      city: 'Wien',
      postalCode: '1100',
      phone: '+43 1 234 567',
      email: 'mario@pizzeria.local',
      currency: 'EUR',
      deliveryDistricts: '["1100", "1110"]',
      minOrderAmount: 15.0,
      openingHoursData: {
        monday: { open: "11:00", close: "22:00", closed: false },
        tuesday: { open: "11:00", close: "22:00", closed: false },
        wednesday: { open: "11:00", close: "22:00", closed: false },
        thursday: { open: "11:00", close: "22:00", closed: false },
        friday: { open: "11:00", close: "23:00", closed: false },
        saturday: { open: "11:00", close: "23:00", closed: false },
        sunday: { open: "12:00", close: "22:00", closed: false }
      }
    }
  });

  await prisma.user.create({
    data: {
      tenantId: marioTenant.id,
      email: 'mario@demo.at',
      password: password,
      role: 'RESTAURANT_MANAGER',
      isActive: true,
      emailVerified: true,
      profile: { create: { firstName: 'Mario', lastName: 'Rossi' } }
    }
  });

  await prisma.user.create({
    data: {
      tenantId: marioTenant.id,
      email: 'office@nextpuls.com',
      password: officePassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      profile: { create: { firstName: 'Office', lastName: 'Admin' } }
    }
  });

  await prisma.category.create({
    data: {
      tenantId: marioTenant.id,
      name: 'Pizza',
      slug: 'pizza',
      isActive: true,
      sortOrder: 1,
      products: {
        create: [
          {
            tenantId: marioTenant.id,
            name: 'Pizza Margherita',
            description: 'Tomaten, Mozzarella, Basilikum',
            price: 9.50,
            articleNumber: 'P001',
            isActive: true
          },
          {
            tenantId: marioTenant.id,
            name: 'Pizza Salami',
            description: 'Tomaten, Käse, Salami',
            price: 11.00,
            articleNumber: 'P002',
            isActive: true
          }
        ]
      }
    }
  });

  // 3. Sushi
  console.log('🍣 Erstelle Sushi Wien...');
  const sushiTenant = await prisma.tenant.create({
    data: {
      name: 'Sushi Wien',
      // slug entfernt
      domain: 'sushi-wien.localhost',
      subdomain: 'sushi',
      isActive: true,
      email: 'order@sushi-wien.local',
      ownerName: 'Hanako Sushi'
    }
  });

  await prisma.restaurantSettings.create({
    data: {
      tenantId: sushiTenant.id,
      restaurantName: 'Sushi Wien',
      address: 'Donauinsel 5',
      city: 'Wien',
      postalCode: '1220',
      phone: '+43 1 999 888',
      email: 'order@sushi-wien.local',
      currency: 'EUR',
      deliveryDistricts: '["1210", "1220"]',
      minOrderAmount: 20.0
    }
  });

  await prisma.user.create({
    data: {
      tenantId: sushiTenant.id,
      email: 'sushi@demo.at',
      password: password,
      role: 'RESTAURANT_MANAGER',
      isActive: true,
      emailVerified: true,
      profile: { create: { firstName: 'Hanako', lastName: 'Sushi' } }
    }
  });

  await prisma.user.create({
    data: {
      tenantId: sushiTenant.id,
      email: 'office@nextpuls.com',
      password: officePassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      profile: { create: { firstName: 'Office', lastName: 'Admin' } }
    }
  });

  await prisma.category.create({
    data: {
      tenantId: sushiTenant.id,
      name: 'Maki',
      slug: 'maki',
      isActive: true,
      products: {
        create: [
          {
            tenantId: sushiTenant.id,
            name: 'Sake Maki',
            description: 'Lachs Rolle',
            price: 4.50,
            articleNumber: 'M001',
            isActive: true
          },
          {
            tenantId: sushiTenant.id,
            name: 'Kappa Maki',
            description: 'Gurken Rolle',
            price: 3.80,
            articleNumber: 'M002',
            isActive: true
          }
        ]
      }
    }
  });

  console.log('✅ Seeding erfolgreich!');
  console.log('------------------------------------------------');
  console.log('1. Landing Page: http://localhost:3000');
  console.log('   Admin: admin@gastro-cms.online / password123');
  console.log('2. Pizzeria:     http://pizzeria-mario.localhost:3000');
  console.log('   Manager: mario@demo.at / password123');
  console.log('3. Sushi:        http://sushi-wien.localhost:3000');
  console.log('   Manager: sushi@demo.at / password123');
  console.log('------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
