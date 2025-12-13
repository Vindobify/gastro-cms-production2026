import { NextRequest, NextResponse } from 'next/server';
import { todoQueries } from '@/lib/database';

async function getTodos() {
  try {
    const todos = todoQueries.getAll();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

async function createTodo(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!data.customer_id || !data.title) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and title are required' },
        { status: 400 }
      );
    }

    const result = todoQueries.create(data);
    
    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Todo created successfully'
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
export const GET = getTodos;
export const POST = createTodo;
