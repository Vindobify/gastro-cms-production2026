import { NextRequest, NextResponse } from 'next/server';
import { todoQueries } from '@/lib/database';

export async function deleteHandler(
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
    
    const result = todoQueries.delete(todoId);
    
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
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}

// Export protected handlers
export const DELETE = deleteHandler;
