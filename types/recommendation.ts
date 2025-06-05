export interface RecommendationRequest {
  selectedInvestors: string[];
  stockSymbol: string;
  investmentAmount?: number;
}

export interface InvestorRecommendation {
  investor: string;
  position: 'BUY' | 'STRONG BUY' | 'HOLD' | 'SELL' | 'NEUTRAL' | 'BUY WITH ACTIVISM';
  confidence: number;
  rationale: string;
  keyPoints: string[];
  risks: string[];
}

export interface MarketResearch {
  currentPrice: string;
  marketCap: string;
  peRatio: string;
  dividendYield: string;
  yearPerformance: string;
  analystRating: string;
  priceTarget: string;
}

export interface RecommendationResponse {
  stockSymbol: string;
  timestamp: string;
  marketResearch: MarketResearch;
  recommendations: InvestorRecommendation[];
  consensus: {
    position: string;
    confidence: number;
    summary: string;
  };
  suggestedAllocation?: {
    amount: number;
    percentage: number;
    rationale: string;
  };
}