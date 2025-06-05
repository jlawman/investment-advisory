import { NextRequest, NextResponse } from 'next/server';
import { db, investorBoards } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Temporary user ID until we implement auth - using UUID format
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

interface CreateBoardRequest {
  name: string;
  investors: string[];
}

interface UpdateBoardRequest {
  name?: string;
  investors?: string[];
}

// GET /api/boards - Get all boards for the current user
export async function GET() {
  try {
    // In production, you would get userId from session/auth
    const userId = TEMP_USER_ID;
    
    const boards = await db
      .select()
      .from(investorBoards)
      .where(eq(investorBoards.userId, userId));

    return NextResponse.json({
      boards,
      userId, // For debugging
    });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investor boards' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new board
export async function POST(request: NextRequest) {
  try {
    const body: CreateBoardRequest = await request.json();
    const { name, investors } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Board name is required' },
        { status: 400 }
      );
    }

    if (!investors || !Array.isArray(investors) || investors.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 investors are required' },
        { status: 400 }
      );
    }

    if (investors.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 investors allowed' },
        { status: 400 }
      );
    }

    // Validate investor IDs
    const validInvestors = ['buffett', 'wood', 'ackman', 'gross'];
    const invalidInvestors = investors.filter(id => !validInvestors.includes(id));
    if (invalidInvestors.length > 0) {
      return NextResponse.json(
        { error: `Invalid investor IDs: ${invalidInvestors.join(', ')}` },
        { status: 400 }
      );
    }

    // Create user if doesn't exist (temporary solution)
    const userId = TEMP_USER_ID;
    
    // Check if user exists
    const { users } = await import('@/lib/db');
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      // Create demo user
      await db.insert(users).values({
        id: userId,
        email: `${userId}@demo.com`,
        name: 'Demo User',
      });
    }

    // Create the board
    const newBoard = await db
      .insert(investorBoards)
      .values({
        id: uuidv4(),
        userId,
        name: name.trim(),
        investors,
      })
      .returning();

    return NextResponse.json({
      board: newBoard[0],
      message: 'Board created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create investor board',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/boards - Update a board
export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const boardId = url.searchParams.get('id');

    if (!boardId) {
      return NextResponse.json(
        { error: 'Board ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateBoardRequest = await request.json();
    const { name, investors } = body;

    // Validation
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Board name cannot be empty' },
        { status: 400 }
      );
    }

    if (investors !== undefined) {
      if (!Array.isArray(investors) || investors.length < 2 || investors.length > 5) {
        return NextResponse.json(
          { error: 'Investors must be an array with 2-5 items' },
          { status: 400 }
        );
      }

      const validInvestors = ['buffett', 'wood', 'ackman', 'gross'];
      const invalidInvestors = investors.filter(id => !validInvestors.includes(id));
      if (invalidInvestors.length > 0) {
        return NextResponse.json(
          { error: `Invalid investor IDs: ${invalidInvestors.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const userId = TEMP_USER_ID;

    // Check if board exists and belongs to user
    const existingBoard = await db
      .select()
      .from(investorBoards)
      .where(eq(investorBoards.id, boardId))
      .limit(1);

    if (existingBoard.length === 0) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    if (existingBoard[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the board
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (investors !== undefined) {
      updateData.investors = investors;
    }

    const updatedBoard = await db
      .update(investorBoards)
      .set(updateData)
      .where(eq(investorBoards.id, boardId))
      .returning();

    return NextResponse.json({
      board: updatedBoard[0],
      message: 'Board updated successfully',
    });

  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update investor board' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards - Delete a board
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const boardId = url.searchParams.get('id');

    if (!boardId) {
      return NextResponse.json(
        { error: 'Board ID is required' },
        { status: 400 }
      );
    }

    const userId = TEMP_USER_ID;

    // Check if board exists and belongs to user
    const existingBoard = await db
      .select()
      .from(investorBoards)
      .where(eq(investorBoards.id, boardId))
      .limit(1);

    if (existingBoard.length === 0) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    if (existingBoard[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the board
    await db
      .delete(investorBoards)
      .where(eq(investorBoards.id, boardId));

    return NextResponse.json({
      message: 'Board deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete investor board' },
      { status: 500 }
    );
  }
}