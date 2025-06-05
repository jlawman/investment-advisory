import { NextRequest, NextResponse } from 'next/server';
import { db, investorBoards } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Temporary user ID until we implement auth - using UUID format
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/boards/[id] - Get a specific board
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const boardId = params.id;
    const userId = TEMP_USER_ID;

    const board = await db
      .select()
      .from(investorBoards)
      .where(eq(investorBoards.id, boardId))
      .limit(1);

    if (board.length === 0) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Check if board belongs to user
    if (board[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      board: board[0],
    });

  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investor board' },
      { status: 500 }
    );
  }
}