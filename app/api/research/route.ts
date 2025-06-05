import { NextRequest, NextResponse } from 'next/server';
import { PerplexityService } from '@/lib/services/perplexity';

interface ResearchRequest {
  stockSymbol: string;
  timeframe?: '1mo' | '6mo' | '1yr';
}

export async function POST(request: NextRequest) {
  try {
    const body: ResearchRequest = await request.json();
    const { stockSymbol, timeframe = '6mo' } = body;

    if (!stockSymbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.PERPLEXITY_API_KEY) {
      // Return mock data if no API key
      return NextResponse.json({
        stockSymbol,
        timeframe,
        timestamp: new Date().toISOString(),
        sentiment: `Mock market sentiment for ${stockSymbol}: The stock has shown strong performance with positive analyst coverage. Recent developments include product launches and expanding market share. Technical indicators suggest continued momentum.`,
        competitors: `Mock competitor analysis for ${stockSymbol}: The company maintains a leading position in its sector with key advantages in technology and brand recognition. Main competitors are investing heavily in R&D to close the gap.`,
        recommendation: `Based on mock analysis, ${stockSymbol} receives a BUY recommendation for the ${timeframe} timeframe. Strong fundamentals and positive market trends support this outlook.`,
        isMockData: true
      });
    }

    // Use actual Perplexity API
    const perplexityService = new PerplexityService();
    const research = await perplexityService.getInvestmentResearch(stockSymbol, timeframe);

    return NextResponse.json({
      stockSymbol,
      timeframe,
      timestamp: new Date().toISOString(),
      ...research,
      isMockData: false
    });

  } catch (error) {
    console.error('Error fetching research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment research' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Investment Research API',
    endpoints: {
      'POST /api/research': {
        description: 'Get investment research for a stock',
        body: {
          stockSymbol: 'string (required)',
          timeframe: '1mo | 6mo | 1yr (optional, default: 6mo)'
        }
      }
    }
  });
}