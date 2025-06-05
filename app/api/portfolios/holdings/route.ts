import { NextRequest, NextResponse } from 'next/server';
import { db, holdings, stocks, portfolios } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Temporary user ID until we implement auth
const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

interface AddHoldingRequest {
  portfolioId: string;
  stockSymbol: string;
  quantity: number;
  averageCost: number;
}

interface UpdateHoldingRequest {
  quantity?: number;
  averageCost?: number;
}

// POST /api/portfolios/holdings - Add a holding to a portfolio
export async function POST(request: NextRequest) {
  try {
    const body: AddHoldingRequest = await request.json();
    const { portfolioId, stockSymbol, quantity, averageCost } = body;

    // Validation
    if (!portfolioId || !stockSymbol || !quantity || !averageCost) {
      return NextResponse.json(
        { error: 'Portfolio ID, stock symbol, quantity, and average cost are required' },
        { status: 400 }
      );
    }

    if (quantity <= 0 || averageCost <= 0) {
      return NextResponse.json(
        { error: 'Quantity and average cost must be positive numbers' },
        { status: 400 }
      );
    }

    const userId = TEMP_USER_ID;

    // Check if portfolio exists and belongs to user
    const portfolio = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, portfolioId))
      .limit(1);

    if (portfolio.length === 0) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    if (portfolio[0].userId !== userId) {
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
          currentPrice: averageCost.toFixed(2), // Use purchase price as placeholder
        })
        .returning();
    }

    const stockId = stock[0].id;

    // Check if holding already exists
    const existingHolding = await db
      .select()
      .from(holdings)
      .where(
        and(
          eq(holdings.portfolioId, portfolioId),
          eq(holdings.stockId, stockId)
        )
      )
      .limit(1);

    if (existingHolding.length > 0) {
      // Update existing holding (add to position)
      const currentQuantity = parseFloat(existingHolding[0].quantity);
      const currentAvgCost = parseFloat(existingHolding[0].averageCost);
      
      const totalCost = (currentQuantity * currentAvgCost) + (quantity * averageCost);
      const newQuantity = currentQuantity + quantity;
      const newAvgCost = totalCost / newQuantity;

      const updatedHolding = await db
        .update(holdings)
        .set({
          quantity: newQuantity.toFixed(4),
          averageCost: newAvgCost.toFixed(2),
          currentValue: (newQuantity * parseFloat(stock[0].currentPrice || '0')).toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(holdings.id, existingHolding[0].id))
        .returning();

      return NextResponse.json({
        holding: updatedHolding[0],
        message: 'Holding updated successfully',
      });
    } else {
      // Create new holding
      const newHolding = await db
        .insert(holdings)
        .values({
          id: uuidv4(),
          portfolioId,
          stockId,
          quantity: quantity.toFixed(4),
          averageCost: averageCost.toFixed(2),
          currentValue: (quantity * parseFloat(stock[0].currentPrice || '0')).toFixed(2),
        })
        .returning();

      return NextResponse.json({
        holding: newHolding[0],
        message: 'Holding added successfully',
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error adding holding:', error);
    return NextResponse.json(
      { error: 'Failed to add holding' },
      { status: 500 }
    );
  }
}

// GET /api/portfolios/holdings?portfolioId=xxx - Get holdings for a portfolio
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const portfolioId = url.searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    const userId = TEMP_USER_ID;

    // Check if portfolio exists and belongs to user
    const portfolio = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, portfolioId))
      .limit(1);

    if (portfolio.length === 0) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    if (portfolio[0].userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get holdings with stock information
    const portfolioHoldings = await db
      .select({
        holding: holdings,
        stock: stocks,
      })
      .from(holdings)
      .leftJoin(stocks, eq(holdings.stockId, stocks.id))
      .where(eq(holdings.portfolioId, portfolioId));

    // Calculate portfolio metrics
    const totalValue = portfolioHoldings.reduce((sum, h) => {
      const value = h.holding.currentValue || '0';
      return sum + parseFloat(value);
    }, 0);

    const totalCost = portfolioHoldings.reduce((sum, h) => {
      const quantity = parseFloat(h.holding.quantity);
      const avgCost = parseFloat(h.holding.averageCost);
      return sum + (quantity * avgCost);
    }, 0);

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return NextResponse.json({
      holdings: portfolioHoldings.map(h => ({
        ...h.holding,
        stock: h.stock,
        gainLoss: h.holding.currentValue && h.holding.quantity && h.holding.averageCost
          ? (parseFloat(h.holding.currentValue) - (parseFloat(h.holding.quantity) * parseFloat(h.holding.averageCost))).toFixed(2)
          : '0.00',
        gainLossPercent: h.holding.quantity && h.holding.averageCost && h.stock?.currentPrice
          ? (((parseFloat(h.stock.currentPrice) - parseFloat(h.holding.averageCost)) / parseFloat(h.holding.averageCost)) * 100).toFixed(2)
          : '0.00',
      })),
      metrics: {
        totalValue: totalValue.toFixed(2),
        totalCost: totalCost.toFixed(2),
        totalGainLoss: totalGainLoss.toFixed(2),
        totalGainLossPercent: totalGainLossPercent.toFixed(2),
      },
    });

  } catch (error) {
    console.error('Error fetching holdings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolios/holdings?id=xxx - Remove a holding
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const holdingId = url.searchParams.get('id');

    if (!holdingId) {
      return NextResponse.json(
        { error: 'Holding ID is required' },
        { status: 400 }
      );
    }

    const userId = TEMP_USER_ID;

    // Get holding with portfolio info
    const holding = await db
      .select({
        holding: holdings,
        portfolio: portfolios,
      })
      .from(holdings)
      .leftJoin(portfolios, eq(holdings.portfolioId, portfolios.id))
      .where(eq(holdings.id, holdingId))
      .limit(1);

    if (holding.length === 0) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      );
    }

    if (holding[0].portfolio?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the holding
    await db
      .delete(holdings)
      .where(eq(holdings.id, holdingId));

    return NextResponse.json({
      message: 'Holding removed successfully',
    });

  } catch (error) {
    console.error('Error deleting holding:', error);
    return NextResponse.json(
      { error: 'Failed to delete holding' },
      { status: 500 }
    );
  }
}