import { NextRequest, NextResponse } from 'next/server';
import { invoiceQueries } from '@/lib/database';

async function getInvoices(request: NextRequest) {
  try {
    const invoices = invoiceQueries.getAll();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

async function createInvoice(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Generate invoice number if not provided
    if (!data.invoice_number) {
      const year = new Date().getFullYear();
      const count = invoiceQueries.getCount() + 1;
      data.invoice_number = `INV-${year}-${count.toString().padStart(4, '0')}`;
    }
    
    const result = invoiceQueries.create(data);
    
    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = getInvoices;
export const POST = createInvoice;
