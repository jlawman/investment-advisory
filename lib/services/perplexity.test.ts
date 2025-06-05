import { PerplexityService } from './perplexity';

// Mock test for Perplexity service
// To run actual tests, set PERPLEXITY_API_KEY in your environment

describe('PerplexityService', () => {
  const mockApiKey = 'test-api-key';
  let service: PerplexityService;

  beforeEach(() => {
    // Mock fetch for testing
    global.fetch = jest.fn();
    service = new PerplexityService(mockApiKey);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('chat', () => {
    it('should make a request to the Perplexity API', async () => {
      const mockResponse = {
        id: 'test-id',
        model: 'sonar-medium-online',
        created: Date.now(),
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'Test response',
          },
          finish_reason: 'stop',
        }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.chat({
        model: 'sonar-medium-online',
        messages: [{ role: 'user', content: 'Test message' }],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.perplexity.ai/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMarketSentiment', () => {
    it('should fetch market sentiment for a stock', async () => {
      const mockSentiment = 'Positive market sentiment for AAPL...';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: { content: mockSentiment }
          }]
        }),
      });

      const result = await service.getMarketSentiment('AAPL');
      expect(result).toBe(mockSentiment);
    });
  });

  describe('getCompetitorAnalysis', () => {
    it('should fetch competitor analysis for a stock', async () => {
      const mockAnalysis = 'AAPL main competitors include Samsung...';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: { content: mockAnalysis }
          }]
        }),
      });

      const result = await service.getCompetitorAnalysis('AAPL');
      expect(result).toBe(mockAnalysis);
    });
  });

  describe('getInvestmentResearch', () => {
    it('should fetch complete investment research', async () => {
      const mockSentiment = 'Positive sentiment';
      const mockCompetitors = 'Strong competitive position';
      const mockRecommendation = 'BUY recommendation';

      // Mock three API calls
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: mockSentiment } }]
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: mockCompetitors } }]
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: mockRecommendation } }]
          }),
        });

      const result = await service.getInvestmentResearch('AAPL', '6mo');
      
      expect(result).toEqual({
        sentiment: mockSentiment,
        competitors: mockCompetitors,
        recommendation: mockRecommendation,
      });

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});

// Example usage (remove in production)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function exampleUsage() {
  if (!process.env.PERPLEXITY_API_KEY) {
    console.log('Set PERPLEXITY_API_KEY to test the service');
    return;
  }

  const service = new PerplexityService();
  
  try {
    console.log('Fetching market sentiment for AAPL...');
    const sentiment = await service.getMarketSentiment('AAPL');
    console.log('Sentiment:', sentiment);

    console.log('\nFetching investment research for AAPL...');
    const research = await service.getInvestmentResearch('AAPL', '6mo');
    console.log('Research:', research);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to test:
// exampleUsage();