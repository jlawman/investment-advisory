import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export interface ResearchData {
  stockSymbol: string;
  timeframe: '1mo' | '6mo' | '1yr';
  timestamp: string;
  sentiment: string;
  competitors: string;
  recommendation: string;
  isMockData: boolean;
}

export function useResearch(stockSymbol: string, timeframe: '1mo' | '6mo' | '1yr' = '6mo') {
  const shouldFetch = stockSymbol && stockSymbol.length > 0;
  
  const { data, error, mutate } = useSWR<ResearchData>(
    shouldFetch ? `/api/research?symbol=${stockSymbol}&timeframe=${timeframe}` : null,
    shouldFetch ? () => fetchResearch(stockSymbol, timeframe) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    research: data,
    isLoading: !error && !data && shouldFetch,
    isError: error,
    mutate,
  };
}

async function fetchResearch(stockSymbol: string, timeframe: string): Promise<ResearchData> {
  const response = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stockSymbol, timeframe }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch research');
  }

  return response.json();
}