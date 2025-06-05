import { NextRequest, NextResponse } from 'next/server';
import { db, recommendations, investorBoards, stocks } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Temporary user ID until we implement auth
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

interface SaveRecommendationRequest {
  boardId: string;
  stockSymbol: string;
  consensus: {
    position: string;
    confidence: number;
    summary: string;
  };
  individualRecommendations: Array<{
    investor: string;
    position: string;
    confidence: number;
    rationale: string;
    keyPoints: string[];
    risks: string[];
  }>;
  marketResearch: {
    currentPrice: string;
    marketCap: string;
    peRatio: string;
    dividendYield: string;
    yearPerformance: string;
    analystRating: string;
    priceTarget: string;
  };
}

// POST /api/portfolios/recommendations - Save a recommendation
export async function POST(request: NextRequest) {
  try {
    const body: SaveRecommendationRequest = await request.json();
    const { boardId, stockSymbol, consensus, individualRecommendations, marketResearch } = body;

    // Validation
    if (!boardId || !stockSymbol || !consensus || !individualRecommendations || !marketResearch) {
      return NextResponse.json(
        { error: 'All recommendation data is required' },
        { status: 400 }
      );
    }

    const userId = TEMP_USER_ID;

    // Verify board exists and belongs to user
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

    if (board[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get or create stock
    let stock = await db
      .select()
      .from(stocks)
      .where(eq(stocks.symbol, stockSymbol.toUpperCase()))
      .limit(1);

    if (stock.length === 0) {
      // Create stock entry
      stock = await db
        .insert(stocks)
        .values({
          symbol: stockSymbol.toUpperCase(),
          name: stockSymbol.toUpperCase(), // In production, fetch from API
          currentPrice: marketResearch.currentPrice.replace('$', ''),
          marketCap: marketResearch.marketCap,
          peRatio: marketResearch.peRatio,
          dividendYield: marketResearch.dividendYield.replace('%', ''),
        })
        .returning();
    }

    const stockId = stock[0].id;

    // Save the recommendation
    const newRecommendation = await db
      .insert(recommendations)
      .values({
        id: uuidv4(),
        userId,
        boardId,
        stockId,
        consensus,
        individualRecommendations,
        marketResearch,
      })
      .returning();

    return NextResponse.json({
      recommendation: newRecommendation[0],
      message: 'Recommendation saved successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to save recommendation' },
      { status: 500 }
    );
  }
}

// GET /api/portfolios/recommendations - Get user's recommendation history
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const boardId = url.searchParams.get('boardId');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const userId = TEMP_USER_ID;

    // Build query
    let query = db
      .select({
        recommendation: recommendations,
        board: investorBoards,
        stock: stocks,
      })
      .from(recommendations)
      .leftJoin(investorBoards, eq(recommendations.boardId, investorBoards.id))
      .leftJoin(stocks, eq(recommendations.stockId, stocks.id))
      .where(eq(recommendations.userId, userId))
      .limit(limit);

    // Filter by board if specified
    if (boardId) {
      const board = await db
        .select()
        .from(investorBoards)
        .where(eq(investorBoards.id, boardId))
        .limit(1);

      if (board.length === 0 || board[0].userId !== userId) {
        return NextResponse.json(
          { error: 'Board not found or unauthorized' },
          { status: 404 }
        );
      }

      query = query.where(eq(recommendations.boardId, boardId));
    }

    const results = await query;

    return NextResponse.json({
      recommendations: results.map(r => ({
        ...r.recommendation,
        board: r.board,
        stock: r.stock,
      })),
      total: results.length,
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}