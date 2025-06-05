'use client';

import { useState } from 'react';

interface StockSearchProps {
  onStockSelect: (symbol: string) => void;
  selectedStock: string;
}

export default function StockSearch({ onStockSelect, selectedStock }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const mockResults = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$195.42' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: '$415.26' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$142.68' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$178.93' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '$238.45' },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: '$353.20' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: '$495.22' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: '$362.49' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: '$156.91' },
    { symbol: 'V', name: 'Visa Inc.', price: '$259.82' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', price: '$156.74' },
    { symbol: 'WMT', name: 'Walmart Inc.', price: '$163.42' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', price: '$149.31' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', price: '$523.95' },
    { symbol: 'DIS', name: 'The Walt Disney Company', price: '$91.33' },
    { symbol: 'MA', name: 'Mastercard Inc.', price: '$419.49' },
    { symbol: 'HD', name: 'The Home Depot Inc.', price: '$346.87' },
    { symbol: 'PFE', name: 'Pfizer Inc.', price: '$28.92' },
    { symbol: 'KO', name: 'The Coca-Cola Company', price: '$59.48' },
    { symbol: 'NKE', name: 'NIKE Inc.', price: '$104.88' },
  ];

  const handleStockSelect = (symbol: string) => {
    onStockSelect(symbol);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-2xl">
      {selectedStock && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-emerald-600 font-medium">Selected Stock:</span>
              <span className="ml-2 text-lg font-bold text-emerald-800">{selectedStock}</span>
            </div>
            <button
              onClick={() => onStockSelect('')}
              className="text-emerald-600 hover:text-emerald-700 text-sm underline"
            >
              Change
            </button>
          </div>
        </div>
      )}
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
              onClick={() => handleStockSelect(stock.symbol)}
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