import { NextRequest, NextResponse } from 'next/server';
import { todoQueries } from '@/lib/database';

async function toggleTodo(
  request: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const { todoId: todoIdParam } = await params;
    const todoId = parseInt(todoIdParam);
    
    if (isNaN(todoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid todo ID' },
        { status: 400 }
      );
    }
    
    const { completed } = await request.json();
    
    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Completed must be a boolean' },
        { status: 400 }
      );
    }
    
    const result = todoQueries.toggle(todoId, completed);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error toggling todo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle todo' },
      { status: 500 }
    );
  }
}

// Export protected handler
export const PUT = toggleTodo;
