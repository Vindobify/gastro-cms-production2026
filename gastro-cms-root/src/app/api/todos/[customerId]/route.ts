import { NextRequest, NextResponse } from 'next/server';
import { todoQueries } from '@/lib/database';

export async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId: customerIdParam } = await params;
    const customerId = parseInt(customerIdParam);
    const todos = await todoQueries.getAll(customerId);
    
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function postHandler(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId: customerIdParam } = await params;
    const customerId = parseInt(customerIdParam);
    const data = await request.json();
    
    const result = await todoQueries.create({
      ...data,
      customer_id: customerId
    });
    
    return NextResponse.json({
      success: true,
      id: result.id
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = getHandler;
export const POST = postHandler;
