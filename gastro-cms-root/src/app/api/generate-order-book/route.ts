import { NextRequest, NextResponse } from 'next/server';
import { generateOrderBookPDF } from '@/lib/pdfGenerator';

export async function postHandler(request: NextRequest) {
  try {
    const { orders } = await request.json();
    
    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json(
        { success: false, error: 'Orders data is required' },
        { status: 400 }
      );
    }
    
    const pdf = await generateOrderBookPDF(orders);
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="auftragsbuch.pdf"'
      }
    });
  } catch (error) {
    console.error('Error generating order book PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const POST = postHandler;
