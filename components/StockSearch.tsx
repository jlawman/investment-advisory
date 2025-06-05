'use client';

import { useState } from 'react';

export default function StockSearch() {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const mockResults = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$195.42' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: '$415.26' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$142.68' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$178.93' },
  ];

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(e.target.value.length > 0);
          }}
          placeholder="Search stocks, ETFs, or enter ticker symbol..."
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-10">
          {mockResults.filter(stock => 
            stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
            stock.name.toLowerCase().includes(query.toLowerCase())
          ).map((stock) => (
            <div 
              key={stock.symbol}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-900">{stock.symbol}</div>
                <div className="text-sm text-gray-600">{stock.name}</div>
              </div>
              <div className="text-lg font-bold text-gray-900">{stock.price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}