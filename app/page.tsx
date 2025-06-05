'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InvestorCard from '@/components/InvestorCard';
import StockSearch from '@/components/StockSearch';
import RecommendationDisplay from '@/components/RecommendationDisplay';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useRecommendations } from '@/lib/hooks/useRecommendations';
import { RecommendationResponse } from '@/types/recommendation';

export default function Home() {
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  const [selectedStock] = useState<string>('AAPL');
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const { isLoading, error, getRecommendations } = useRecommendations();

  const investors = [
    {
      id: 'buffett',
      name: 'Warren Buffett',
      title: 'CEO of Berkshire Hathaway',
      philosophy: 'Value investing pioneer focused on buying undervalued companies with strong fundamentals and holding them long-term.'
    },
    {
      id: 'wood',
      name: 'Cathie Wood',
      title: 'CEO of ARK Invest',
      philosophy: 'Disruptive innovation investor focusing on genomics, artificial intelligence, robotics, and blockchain technology.'
    },
    {
      id: 'ackman',
      name: 'Bill Ackman',
      title: 'CEO of Pershing Square Capital',
      philosophy: 'Activist investor who takes large positions in companies and pushes for operational improvements.'
    },
    {
      id: 'gross',
      name: 'Bill Gross',
      title: 'Co-founder of PIMCO',
      philosophy: 'Bond king known for expertise in fixed income markets and macroeconomic analysis.'
    }
  ];

  const handleInvestorSelect = (investorId: string) => {
    if (selectedInvestors.includes(investorId)) {
      setSelectedInvestors(selectedInvestors.filter(id => id !== investorId));
    } else if (selectedInvestors.length < 5) {
      setSelectedInvestors([...selectedInvestors, investorId]);
    }
  };

  const handleGetRecommendations = async () => {
    if (selectedInvestors.length < 2) return;
    
    try {
      const data = await getRecommendations(selectedInvestors, selectedStock, 10000);
      setRecommendations(data);
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to get recommendations:', err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Get Investment Advice from Legendary Investors
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create your personal board of advisors from the world&apos;s most successful investors. 
            Get AI-powered insights based on their proven strategies and philosophies.
          </p>
        </section>

        {/* Stock Search Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Search for Investment Opportunities
          </h2>
          <div className="flex justify-center">
            <StockSearch />
          </div>
        </section>

        {/* Investor Selection Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Advisory Board
            </h2>
            <p className="text-gray-600">
              Select 2-5 legendary investors to form your personal advisory board 
              ({selectedInvestors.length}/5 selected)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {investors.map((investor) => (
              <InvestorCard
                key={investor.id}
                name={investor.name}
                title={investor.title}
                philosophy={investor.philosophy}
                selected={selectedInvestors.includes(investor.id)}
                onSelect={() => handleInvestorSelect(investor.id)}
              />
            ))}
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              <p className="font-semibold">Error: {error}</p>
              <p className="text-sm mt-1">Please try again or contact support if the issue persists.</p>
            </div>
          )}

          {selectedInvestors.length >= 2 && (
            <div className="mt-12 text-center">
              <button 
                onClick={handleGetRecommendations}
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white text-lg px-8 py-4 rounded-lg transition-colors flex items-center gap-3 mx-auto"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Recommendations...
                  </>
                ) : (
                  'Get Investment Recommendations'
                )}
              </button>
            </div>
          )}
        </section>
      </main>

      {recommendations && (
        <RecommendationDisplay 
          data={recommendations} 
          onClose={() => setRecommendations(null)}
        />
      )}
      </div>
    </ErrorBoundary>
  );
}