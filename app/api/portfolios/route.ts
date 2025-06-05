import { NextRequest, NextResponse } from 'next/server';
import { db, portfolios, holdings, stocks } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Temporary user ID until we implement auth
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

interface CreatePortfolioRequest {
  name: string;
}


// GET /api/portfolios - Get all portfolios for the current user
export async function GET() {
  try {
    const userId = TEMP_USER_ID;
    
    // Get portfolios with their holdings
    const userPortfolios = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.updatedAt));

    // For each portfolio, get holdings count and total value
    const portfoliosWithStats = await Promise.all(
      userPortfolios.map(async (portfolio) => {
        const portfolioHoldings = await db
          .select({
            holding: holdings,
            stock: stocks,
          })
          .from(holdings)
          .leftJoin(stocks, eq(holdings.stockId, stocks.id))
          .where(eq(holdings.portfolioId, portfolio.id));

        const totalValue = portfolioHoldings.reduce((sum, h) => {
          const value = h.holding.currentValue || '0';
          return sum + parseFloat(value);
        }, 0);

        return {
          ...portfolio,
          holdingsCount: portfolioHoldings.length,
          totalValue: totalValue.toFixed(2),
        };
      })
    );

    return NextResponse.json({
      portfolios: portfoliosWithStats,
      userId,
    });

  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

// POST /api/portfolios - Create a new portfolio
export async function POST(request: NextRequest) {
  try {
    const body: CreatePortfolioRequest = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Portfolio name is required' },
        { status: 400 }
      );
    }

    const userId = TEMP_USER_ID;

    // Create the portfolio
    const newPortfolio = await db
      .insert(portfolios)
      .values({
        id: uuidv4(),
        userId,
        name: name.trim(),
        totalValue: '0',
      })
      .returning();

    return NextResponse.json({
      portfolio: newPortfolio[0],
      message: 'Portfolio created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}

// PATCH /api/portfolios - Update a portfolio
export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const portfolioId = url.searchParams.get('id');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Portfolio name cannot be empty' },
        { status: 400 }
      );
    }

    const userId = TEMP_USER_ID;

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, portfolioId))
      .limit(1);

    if (existingPortfolio.length === 0) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    if (existingPortfolio[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update the portfolio
    const updateData: Record<string, string | Date> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    const updatedPortfolio = await db
      .update(portfolios)
      .set(updateData)
      .where(eq(portfolios.id, portfolioId))
      .returning();

    return NextResponse.json({
      portfolio: updatedPortfolio[0],
      message: 'Portfolio updated successfully',
    });

  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolios - Delete a portfolio
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const portfolioId = url.searchParams.get('id');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    const userId = TEMP_USER_ID;

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, portfolioId))
      .limit(1);

    if (existingPortfolio.length === 0) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    if (existingPortfolio[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete all holdings first
    await db
      .delete(holdings)
      .where(eq(holdings.portfolioId, portfolioId));

    // Delete the portfolio
    await db
      .delete(portfolios)
      .where(eq(portfolios.id, portfolioId));

    return NextResponse.json({
      message: 'Portfolio deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}