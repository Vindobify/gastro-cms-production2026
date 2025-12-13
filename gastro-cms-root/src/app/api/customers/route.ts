import { NextRequest, NextResponse } from 'next/server';
import { customerQueries } from '@/lib/database';

async function getCustomers() {
  try {
    const customers = customerQueries.getAll();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

async function createCustomer(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!data.restaurant_name || !data.email) {
      return NextResponse.json(
        { success: false, error: 'Restaurant name and email are required' },
        { status: 400 }
      );
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const result = customerQueries.create(data);
    
    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = getCustomers;
export const POST = createCustomer;