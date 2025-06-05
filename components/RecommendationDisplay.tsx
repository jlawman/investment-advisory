import { RecommendationResponse } from '@/types/recommendation';

interface RecommendationDisplayProps {
  data: RecommendationResponse;
  onClose: () => void;
}

export default function RecommendationDisplay({ data, onClose }: RecommendationDisplayProps) {
  const getPositionColor = (position: string) => {
    if (position.includes('BUY')) return 'text-green-600';
    if (position === 'SELL') return 'text-red-600';
    return 'text-gray-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Investment Recommendations for {data.stockSymbol}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Market Research */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Market Research</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="font-bold">{data.marketResearch.currentPrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="font-bold">{data.marketResearch.marketCap}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">P/E Ratio</p>
                <p className="font-bold">{data.marketResearch.peRatio}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">1Y Performance</p>
                <p className="font-bold text-green-600">{data.marketResearch.yearPerformance}</p>
              </div>
            </div>
          </section>

          {/* Consensus */}
          <section className="bg-emerald-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">Consensus Recommendation</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className={`text-2xl font-bold ${getPositionColor(data.consensus.position)}`}>
                {data.consensus.position}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div 
                      className={`h-full rounded-full ${getConfidenceColor(data.consensus.confidence)}`}
                      style={{ width: `${data.consensus.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{(data.consensus.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700">{data.consensus.summary}</p>
          </section>

          {/* Individual Recommendations */}
          <section>
            <h3 className="font-semibold text-lg mb-4">Individual Advisor Recommendations</h3>
            <div className="space-y-4">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{rec.investor}</h4>
                      <span className={`text-lg font-bold ${getPositionColor(rec.position)}`}>
                        {rec.position}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="font-semibold">{(rec.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{rec.rationale}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-2">Key Points</h5>
                      <ul className="space-y-1">
                        {rec.keyPoints.map((point, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-gray-600 mb-2">Risks</h5>
                      <ul className="space-y-1">
                        {rec.risks.map((risk, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Suggested Allocation */}
          {data.suggestedAllocation && (
            <section className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Suggested Allocation</h3>
              <p className="text-gray-700">
                Based on the consensus, we suggest allocating {data.suggestedAllocation.percentage}% 
                of your ${data.suggestedAllocation.amount.toLocaleString()} investment to {data.stockSymbol}.
              </p>
              <p className="text-sm text-gray-600 mt-2">{data.suggestedAllocation.rationale}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}