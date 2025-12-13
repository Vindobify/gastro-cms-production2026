import { NextRequest, NextResponse } from 'next/server';
import { todoQueries, customerQueries } from '@/lib/database';

export async function getHandler(request: NextRequest) {
  try {
    // Get all customers first
    const customers = customerQueries.getAll();
    
    // Get todos for each customer
    const allTodos = [];
    for (const customer of customers) {
      const todos = todoQueries.getByCustomerId(customer.id);
      allTodos.push(...todos);
    }
    
    return NextResponse.json(allTodos);
  } catch (error) {
    console.error('Error fetching all todos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const GET = getHandler;
