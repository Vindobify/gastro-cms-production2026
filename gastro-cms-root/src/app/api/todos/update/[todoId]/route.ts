import { NextRequest, NextResponse } from 'next/server';
import { todoQueries } from '@/lib/database';

export async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const { todoId: todoIdParam } = await params;
    const todoId = parseInt(todoIdParam);
    const data = await request.json();
    
    // Prüfe ob Todo existiert
    const existingTodo = await todoQueries.getById(todoId);
    if (!existingTodo) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    const result = await todoQueries.update(todoId, data);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      todo: result
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const { todoId: todoIdParam } = await params;
    const todoId = parseInt(todoIdParam);
    
    // Prüfe ob Todo existiert
    const existingTodo = await todoQueries.getById(todoId);
    if (!existingTodo) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    const result = await todoQueries.delete(todoId);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete todo' },
        { status: 500 }
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
export const PUT = putHandler;
export const DELETE = deleteHandler;
