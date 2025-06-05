import { NextRequest, NextResponse } from 'next/server';
import type { InvestorRecommendation } from '@/types/recommendation';

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
  personaId: string,
  persona: InvestorPersona,
  stockSymbol: string,
  marketResearch: {
    currentPrice?: string;
    marketCap?: string;
    peRatio?: string;
    dividendYield?: string;
    yearPerformance?: string;
    analystRating?: string;
    priceTarget?: string;
    sentiment?: string;
    competitors?: string;
  }
): Promise<Omit<InvestorRecommendation, 'investor'>> {
  const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!perplexityApiKey) {
    // Fallback to mock data if no API key
    return generateMockRecommendation(personaId, stockSymbol);
  }

  try {
    const prompt = `You are ${persona.name}, a legendary investor known for ${persona.strategy}. 
    
    Analyze ${stockSymbol} stock from your unique investment perspective considering:
    - Your investment strategy: ${persona.strategy}
    - Your risk profile: ${persona.riskProfile}
    - Your typical time horizon: ${persona.timeHorizon}
    - Key metrics you focus on: ${persona.keyMetrics.join(', ')}
    
    Current market data for ${stockSymbol}:
    ${JSON.stringify(marketResearch, null, 2)}
    
    Provide your investment recommendation in the following format:
    1. Position: BUY, HOLD, or SELL
    2. Confidence: A number between 0 and 1 (e.g., 0.85 for 85% confidence)
    3. Rationale: A 2-3 sentence explanation of your recommendation from your investment philosophy perspective
    4. Key Points: 3 bullet points supporting your position
    5. Risks: 2 main risks to consider
    
    Be specific and true to ${persona.name}'s actual investment style and philosophy.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that analyzes stocks from the perspective of legendary investors. Provide structured investment recommendations based on their actual investment philosophies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the AI response
    const positionMatch = content.match(/Position:\s*(BUY|HOLD|SELL)/i);
    const confidenceMatch = content.match(/Confidence:\s*(0?\.\d+|1\.0|1)/);
    
    const position = positionMatch ? positionMatch[1].toUpperCase() as 'BUY' | 'HOLD' | 'SELL' : 'HOLD';
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
    
    // Extract rationale (everything between "Rationale:" and "Key Points:")
    const rationaleMatch = content.match(/Rationale:\s*([^]+?)(?=Key Points:|$)/i);
    const rationale = rationaleMatch ? rationaleMatch[1].trim() : `Based on ${persona.name}'s investment philosophy, ${stockSymbol} presents an interesting opportunity.`;
    
    // Extract key points
    const keyPointsMatch = content.match(/Key Points:([^]+?)(?=Risks:|$)/i);
    const keyPointsText = keyPointsMatch ? keyPointsMatch[1] : '';
    const keyPoints = keyPointsText
      .split('\n')
      .filter((line: string) => line.trim().match(/^[-•*]\s*(.+)/))
      .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
      .filter((point: string) => point.length > 0)
      .slice(0, 3);
    
    // Extract risks
    const risksMatch = content.match(/Risks:([^]+?)$/i);
    const risksText = risksMatch ? risksMatch[1] : '';
    const risks = risksText
      .split('\n')
      .filter((line: string) => line.trim().match(/^[-•*]\s*(.+)/))
      .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
      .filter((risk: string) => risk.length > 0)
      .slice(0, 2);

    return {
      position,
      confidence,
      rationale,
      keyPoints: keyPoints.length > 0 ? keyPoints : [
        `Aligns with ${persona.name}'s investment criteria`,
        `Suitable for ${persona.timeHorizon} investment horizon`,
        `Matches ${persona.riskProfile} risk profile`
      ],
      risks: risks.length > 0 ? risks : [
        'Market volatility could impact short-term performance',
        'Execution risk on strategic initiatives'
      ]
    };
  } catch (error) {
    console.error(`Error generating recommendation for ${persona.name}:`, error);
    // Fallback to mock data on error
    return generateMockRecommendation(personaId, stockSymbol);
  }
}

function generateMockRecommendation(personaId: string, stockSymbol: string): Omit<InvestorRecommendation, 'investor'> {
  const mockRecommendations: Record<string, Omit<InvestorRecommendation, 'investor'>> = {
    buffett: {
      position: 'BUY' as const,
      confidence: 0.75,
      rationale: `Based on Warren Buffett's value investing principles, ${stockSymbol} appears undervalued relative to its intrinsic value. The company shows strong fundamentals with consistent free cash flow generation and a sustainable competitive advantage (moat).`,
      keyPoints: [
        'Trading below intrinsic value with margin of safety',
        'Strong competitive moat and pricing power',
        'Excellent management with shareholder-friendly practices'
      ],
      risks: [
        'Short-term market volatility may impact stock price',
        'Regulatory changes could affect profitability'
      ]
    },
    wood: {
      position: 'BUY' as const,
      confidence: 0.85,
      rationale: `From Cathie Wood's perspective, ${stockSymbol} is positioned at the forefront of technological disruption. The company's innovative approach and exponential growth potential make it an attractive investment for the next decade.`,
      keyPoints: [
        'Leading position in disruptive technology sector',
        'Exponential revenue growth trajectory',
        'Large and expanding total addressable market'
      ],
      risks: [
        'High valuation multiples increase downside risk',
        'Competitive threats from other innovators'
      ]
    },
    ackman: {
      position: 'HOLD' as const,
      confidence: 0.60,
      rationale: `Bill Ackman's analysis suggests ${stockSymbol} has potential but requires operational improvements. While the fundamentals are solid, activist involvement could unlock additional shareholder value.`,
      keyPoints: [
        'Solid business model with improvement opportunities',
        'Potential for margin expansion through efficiency',
        'Strong brand value and market position'
      ],
      risks: [
        'Management resistance to strategic changes',
        'Integration risks from recent acquisitions'
      ]
    },
    gross: {
      position: 'SELL' as const,
      confidence: 0.70,
      rationale: `Bill Gross's macroeconomic analysis indicates headwinds for ${stockSymbol}. Rising interest rates and tightening financial conditions suggest better opportunities in fixed income markets.`,
      keyPoints: [
        'Vulnerable to interest rate increases',
        'Better risk-adjusted returns available in bonds',
        'Macroeconomic headwinds affecting sector'
      ],
      risks: [
        'Potential for continued equity market momentum',
        'Company-specific catalysts could override macro concerns'
      ]
    }
  };

  return mockRecommendations[personaId] || mockRecommendations.buffett;
}

async function getMarketResearch(stockSymbol: string) {
  // Try to get real market data from research endpoint
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stockSymbol, timeframe: '6mo' })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        currentPrice: data.currentPrice || '$150.00',
        marketCap: data.marketCap || '$2.5T',
        peRatio: data.peRatio || '25.5',
        dividendYield: data.dividendYield || '0.5%',
        yearPerformance: data.yearPerformance || '+15.2%',
        analystRating: data.analystRating || 'Buy',
        priceTarget: data.priceTarget || '$170.00',
        sentiment: data.sentiment || 'Positive',
        competitors: data.competitors || 'GOOGL, MSFT, META'
      };
    }
  } catch (error) {
    console.error('Error fetching market research:', error);
  }

  // Fallback mock data
  return {
    currentPrice: '$150.00',
    marketCap: '$2.5T',
    peRatio: '25.5',
    dividendYield: '0.5%',
    yearPerformance: '+15.2%',
    analystRating: 'Buy',
    priceTarget: '$170.00'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { selectedInvestors, stockSymbol, investmentAmount = 10000 } = body;

    // Validation
    if (!selectedInvestors || selectedInvestors.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 investors must be selected' },
        { status: 400 }
      );
    }

    if (!stockSymbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' },
        { status: 400 }
      );
    }

    // Get market research data
    const marketResearch = await getMarketResearch(stockSymbol);

    // Generate recommendations for each selected investor
    const recommendationPromises = selectedInvestors.map(async (investorId) => {
      const persona = investorPersonas[investorId];
      if (!persona) {
        throw new Error(`Unknown investor: ${investorId}`);
      }

      const recommendation = await generatePersonaRecommendation(
        investorId,
        persona,
        stockSymbol,
        marketResearch
      );

      return {
        investor: investorId,
        ...recommendation
      };
    });

    const individualRecommendations = await Promise.all(recommendationPromises);

    // Calculate consensus
    const positions = individualRecommendations.map(r => r.position);
    const buyCount = positions.filter(p => p === 'BUY').length;
    const holdCount = positions.filter(p => p === 'HOLD').length;
    const sellCount = positions.filter(p => p === 'SELL').length;

    let consensusPosition: 'BUY' | 'HOLD' | 'SELL';
    if (buyCount > holdCount && buyCount > sellCount) {
      consensusPosition = 'BUY';
    } else if (sellCount > holdCount && sellCount > buyCount) {
      consensusPosition = 'SELL';
    } else {
      consensusPosition = 'HOLD';
    }

    const avgConfidence = individualRecommendations.reduce((sum, r) => sum + r.confidence, 0) / individualRecommendations.length;

    const consensus = {
      position: consensusPosition,
      confidence: Math.round(avgConfidence * 100) / 100,
      summary: `Based on analysis from ${selectedInvestors.length} legendary investors, the consensus recommendation for ${stockSymbol} is ${consensusPosition} with ${Math.round(avgConfidence * 100)}% average confidence.`
    };

    // Calculate allocation recommendation
    let allocationPercentage: number;
    if (consensusPosition === 'BUY') {
      allocationPercentage = Math.round(avgConfidence * 20); // Max 20% for a single position
    } else if (consensusPosition === 'HOLD') {
      allocationPercentage = 5; // Small position for HOLD
    } else {
      allocationPercentage = 0; // No allocation for SELL
    }

    const allocation = {
      percentage: allocationPercentage,
      amount: Math.round(investmentAmount * (allocationPercentage / 100)),
      rationale: `Based on the ${consensusPosition} consensus and ${Math.round(avgConfidence * 100)}% confidence level, allocating ${allocationPercentage}% of your portfolio to ${stockSymbol} aligns with prudent risk management.`
    };

    return NextResponse.json({
      stockSymbol,
      consensus,
      individualRecommendations,
      allocation,
      marketResearch,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}