# External Services

## Perplexity API Integration

The Perplexity service provides real-time market sentiment and competitor analysis using the Sonar online model.

### Setup

1. Get your API key from [Perplexity Settings](https://www.perplexity.ai/settings/api)
2. Add to `.env.local`:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

### Usage

```typescript
import { PerplexityService } from '@/lib/services/perplexity';

const service = new PerplexityService();

// Get market sentiment
const sentiment = await service.getMarketSentiment('AAPL');

// Get competitor analysis
const competitors = await service.getCompetitorAnalysis('AAPL');

// Get complete investment research
const research = await service.getInvestmentResearch('AAPL', '6mo');
```

### API Endpoint

```bash
# Get investment research
POST /api/research
{
  "stockSymbol": "AAPL",
  "timeframe": "6mo"  // Options: 1mo, 6mo, 1yr
}
```

### Features

- **Market Sentiment Analysis**: Recent news, analyst opinions, social media sentiment
- **Competitor Analysis**: Market share, competitive positioning, industry trends
- **Investment Recommendations**: Time-based recommendations with clear rationale
- **Mock Mode**: Returns sample data when API key is not configured

### Rate Limits

- Perplexity API has rate limits based on your plan
- Service includes error handling for rate limit scenarios
- Consider caching responses to minimize API calls

## Future Integrations

### Gemini API
- For generating persona-specific investment analysis
- Each investor persona will have unique prompts

### Stock Data APIs
- Alpha Vantage or Yahoo Finance for real-time stock data
- Fundamental data, technical indicators, historical prices

### Anthropic API
- For more sophisticated persona generation
- Advanced reasoning about investment strategies