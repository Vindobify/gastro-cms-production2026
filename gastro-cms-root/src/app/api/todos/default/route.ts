import { NextRequest, NextResponse } from 'next/server';
import { todoQueries } from '@/lib/database';

async function postHandler(request: NextRequest) {
  try {
    const { customer_id } = await request.json();
    
    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    todoQueries.createDefault(customer_id);
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error creating default todos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create default todos' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const POST = postHandler;
