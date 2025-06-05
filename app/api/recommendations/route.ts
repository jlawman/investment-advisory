import { NextRequest, NextResponse } from 'next/server';

interface RecommendationRequest {
  selectedInvestors: string[];
  stockSymbol: string;
  investmentAmount?: number;
}

interface InvestorPersona {
  name: string;
  strategy: string;
  riskProfile: string;
  timeHorizon: string;
  keyMetrics: string[];
}

const investorPersonas: Record<string, InvestorPersona> = {
  buffett: {
    name: 'Warren Buffett',
    strategy: 'Value investing with focus on intrinsic value',
    riskProfile: 'Conservative',
    timeHorizon: 'Long-term (10+ years)',
    keyMetrics: ['P/E ratio', 'Book value', 'ROE', 'Debt-to-equity', 'Free cash flow']
  },
  wood: {
    name: 'Cathie Wood',
    strategy: 'Disruptive innovation and exponential growth',
    riskProfile: 'Aggressive',
    timeHorizon: 'Medium to long-term (5-10 years)',
    keyMetrics: ['Revenue growth', 'TAM expansion', 'Innovation metrics', 'Market disruption potential']
  },
  ackman: {
    name: 'Bill Ackman',
    strategy: 'Activist value investing with operational improvements',
    riskProfile: 'Moderate to aggressive',
    timeHorizon: 'Medium-term (3-5 years)',
    keyMetrics: ['Operating margins', 'Management quality', 'Strategic positioning', 'Turnaround potential']
  },
  gross: {
    name: 'Bill Gross',
    strategy: 'Fixed income and macroeconomic trends',
    riskProfile: 'Moderate',
    timeHorizon: 'Short to medium-term (1-5 years)',
    keyMetrics: ['Interest rate sensitivity', 'Credit quality', 'Duration risk', 'Yield spread']
  }
};

async function generatePersonaRecommendation(
  persona: InvestorPersona,
  stockSymbol: string
): Promise<any> {
  // In a real implementation, this would call Gemini API to generate persona-based analysis
  // For now, returning structured mock data
  
  const recommendations = {
    buffett: {
      position: 'BUY',
      confidence: 0.75,
      rationale: `Based on Warren Buffett's value investing principles, ${stockSymbol} appears undervalued relative to its intrinsic value. The company shows strong fundamentals with consistent free cash flow generation and a sustainable competitive advantage (moat).`,
      keyPoints: [
        'Trading below intrinsic value with margin of safety',
        'Strong and predictable cash flows',
        'Excellent management with shareholder-friendly policies',
        'Durable competitive advantage in the industry'
      ],
      risks: [
        'Market volatility in the short term',
        'Potential regulatory changes affecting the industry'
      ]
    },
    wood: {
      position: 'STRONG BUY',
      confidence: 0.85,
      rationale: `From Cathie Wood's perspective, ${stockSymbol} is positioned at the forefront of technological disruption. The company's innovation pipeline and market positioning suggest exponential growth potential over the next decade.`,
      keyPoints: [
        'Leading position in disruptive technology',
        'Exponential growth trajectory expected',
        'Large and expanding total addressable market',
        'Strong innovation and R&D capabilities'
      ],
      risks: [
        'High volatility due to growth stock nature',
        'Execution risk on innovative products',
        'Competition from other tech giants'
      ]
    },
    ackman: {
      position: 'BUY WITH ACTIVISM',
      confidence: 0.70,
      rationale: `Bill Ackman would see ${stockSymbol} as an opportunity for activist investing. While the company has strong assets, there's significant potential for operational improvements and strategic repositioning.`,
      keyPoints: [
        'Underperforming assets that could be optimized',
        'Opportunity for margin expansion',
        'Potential for strategic acquisitions or divestitures',
        'Management changes could unlock value'
      ],
      risks: [
        'Resistance to activist proposals',
        'Implementation challenges',
        'Market reaction to major changes'
      ]
    },
    gross: {
      position: 'NEUTRAL',
      confidence: 0.60,
      rationale: `From Bill Gross's macroeconomic perspective, ${stockSymbol} faces headwinds from rising interest rates and economic uncertainty. Consider fixed income alternatives for better risk-adjusted returns.`,
      keyPoints: [
        'Interest rate sensitivity affects valuation',
        'Better opportunities in bond markets',
        'Macroeconomic headwinds present',
        'Consider defensive positioning'
      ],
      risks: [
        'Equity market volatility',
        'Interest rate risk',
        'Economic recession possibility'
      ]
    }
  };

  return recommendations[persona.name.toLowerCase().split(' ').pop()] || recommendations.buffett;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { selectedInvestors, stockSymbol, investmentAmount } = body;

    if (!selectedInvestors || selectedInvestors.length < 2) {
      return NextResponse.json(
        { error: 'Please select at least 2 investors' },
        { status: 400 }
      );
    }

    if (!stockSymbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }

    // Generate recommendations from each selected investor
    const recommendations = await Promise.all(
      selectedInvestors.map(async (investorId) => {
        const persona = investorPersonas[investorId];
        if (!persona) return null;

        const recommendation = await generatePersonaRecommendation(persona, stockSymbol);
        
        return {
          investor: persona.name,
          ...recommendation
        };
      })
    );

    // Calculate consensus
    const validRecommendations = recommendations.filter(r => r !== null);
    const avgConfidence = validRecommendations.reduce((sum, r) => sum + r.confidence, 0) / validRecommendations.length;
    
    const positionCounts = validRecommendations.reduce((acc, r) => {
      const position = r.position.includes('BUY') ? 'BUY' : r.position;
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const consensusPosition = Object.entries(positionCounts)
      .sort(([, a], [, b]) => b - a)[0][0];

    // Simulate AI-powered research summary
    const marketResearch = {
      currentPrice: '$195.42',
      marketCap: '$3.04T',
      peRatio: '32.5',
      dividendYield: '0.44%',
      yearPerformance: '+48.2%',
      analystRating: 'Buy',
      priceTarget: '$220.00'
    };

    return NextResponse.json({
      stockSymbol,
      timestamp: new Date().toISOString(),
      marketResearch,
      recommendations: validRecommendations,
      consensus: {
        position: consensusPosition,
        confidence: avgConfidence,
        summary: `Based on the combined wisdom of your advisory board, the consensus recommendation for ${stockSymbol} is ${consensusPosition} with ${(avgConfidence * 100).toFixed(0)}% confidence.`
      },
      suggestedAllocation: investmentAmount ? {
        amount: investmentAmount,
        percentage: consensusPosition === 'BUY' ? 5 : consensusPosition === 'STRONG BUY' ? 10 : 0,
        rationale: 'Allocation based on consensus confidence and risk management principles'
      } : null
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}