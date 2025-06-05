interface PerplexityRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

export class PerplexityService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai';
  
  constructor(apiKey?: string) {
    if (!apiKey && !process.env.PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key is required');
    }
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY || '';
  }

  async chat(request: PerplexityRequest): Promise<PerplexityResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || 'sonar-medium-online',
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getMarketSentiment(stockSymbol: string): Promise<string> {
    const prompt = `Analyze the current market sentiment for ${stockSymbol}. Include:
    1. Recent news and developments
    2. Analyst opinions and price targets
    3. Social media sentiment
    4. Key risks and opportunities
    5. Technical analysis indicators
    
    Provide a concise summary focused on actionable insights.`;

    const response = await this.chat({
      model: 'sonar-medium-online',
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst providing market sentiment analysis. Be objective, data-driven, and concise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message.content || 'Unable to fetch market sentiment';
  }

  async getCompetitorAnalysis(stockSymbol: string): Promise<string> {
    const prompt = `Provide a competitive analysis for ${stockSymbol}. Include:
    1. Main competitors and market share
    2. Competitive advantages and disadvantages
    3. Industry position and trends
    4. Recent competitive moves
    5. Future outlook vs competitors
    
    Focus on investment-relevant insights.`;

    const response = await this.chat({
      model: 'sonar-medium-online',
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst specializing in competitive analysis. Provide clear, investment-focused insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message.content || 'Unable to fetch competitor analysis';
  }

  async getInvestmentResearch(stockSymbol: string, timeframe: '1mo' | '6mo' | '1yr' = '6mo'): Promise<{
    sentiment: string;
    competitors: string;
    recommendation: string;
  }> {
    try {
      // Run both analyses in parallel for efficiency
      const [sentiment, competitors] = await Promise.all([
        this.getMarketSentiment(stockSymbol),
        this.getCompetitorAnalysis(stockSymbol)
      ]);

      // Generate a recommendation based on the research
      const recommendationPrompt = `Based on the following research for ${stockSymbol}, provide a ${timeframe} investment recommendation:

Market Sentiment:
${sentiment}

Competitive Analysis:
${competitors}

Provide a clear BUY/HOLD/SELL recommendation with rationale.`;

      const recommendationResponse = await this.chat({
        model: 'sonar-medium-online',
        messages: [
          {
            role: 'system',
            content: 'You are an investment advisor providing clear, actionable recommendations.'
          },
          {
            role: 'user',
            content: recommendationPrompt
          }
        ],
        temperature: 0.2,
      });

      return {
        sentiment,
        competitors,
        recommendation: recommendationResponse.choices[0]?.message.content || 'Unable to generate recommendation'
      };
    } catch (error) {
      console.error('Error fetching investment research:', error);
      throw error;
    }
  }
}

// Export a singleton instance if API key is available
export const perplexityService = process.env.PERPLEXITY_API_KEY 
  ? new PerplexityService() 
  : null;