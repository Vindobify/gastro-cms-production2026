import { NextRequest, NextResponse } from 'next/server';
import { invoiceQueries, customerQueries } from '@/lib/database';
import { generateInvoicePDF } from '@/lib/pdfGenerator';

export async function postHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const invoice = invoiceQueries.getById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    const customer = customerQueries.getById((invoice as { customer_id: number }).customer_id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    const pdfBuffer = await generateInvoicePDF(invoice, customer);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rechnung-${(invoice as { invoice_number: string }).invoice_number}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const POST = postHandler;
