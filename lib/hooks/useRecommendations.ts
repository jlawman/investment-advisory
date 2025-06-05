import { useState } from 'react';
import { RecommendationResponse } from '@/types/recommendation';

export function useRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async (
    selectedInvestors: string[],
    stockSymbol: string,
    investmentAmount?: number
  ): Promise<RecommendationResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedInvestors,
          stockSymbol,
          investmentAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecommendation = async (
    boardId: string,
    recommendation: RecommendationResponse
  ) => {
    try {
      const response = await fetch('/api/portfolios/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          stockSymbol: recommendation.stockSymbol,
          consensus: recommendation.consensus,
          individualRecommendations: recommendation.recommendations,
          marketResearch: recommendation.marketResearch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save recommendation');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save recommendation';
      throw new Error(message);
    }
  };

  return {
    isLoading,
    error,
    getRecommendations,
    saveRecommendation,
  };
}