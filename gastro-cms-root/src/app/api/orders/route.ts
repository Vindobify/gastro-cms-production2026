import { NextRequest, NextResponse } from 'next/server';
import { orderQueries } from '@/lib/database';
import { sendOrderEmail, OrderFormData } from '@/lib/emailService';

async function getOrders() {
  try {
    const orders = orderQueries.getAll();
    const stats = orderQueries.getStats();
    
    return NextResponse.json({
      success: true,
      orders,
      stats
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

async function createOrder(request: NextRequest) {
  try {
    const data: OrderFormData = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!data.restaurant_name || !data.owner_name || !data.email) {
      return NextResponse.json(
        { success: false, error: 'Restaurant-Name, Inhaber-Name und E-Mail sind erforderlich' },
        { status: 400 }
      );
    }

    // E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Bestellung in Datenbank speichern
    const result = orderQueries.create(data);
    
    // E-Mail senden
    const emailSent = await sendOrderEmail(data);
    
    if (!emailSent) {
      console.warn('Order created but email failed to send');
    }
    
    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Bestellanfrage erfolgreich gesendet! Wir melden uns schnellstmöglich bei dir.'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// Export handlers
export const GET = getOrders;
export const POST = createOrder; // Öffentlich zugänglich für Bestellformular
