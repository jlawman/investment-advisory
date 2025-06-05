export function InvestorCardSkeleton() {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BoardsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
          <div className="flex justify-between items-start mb-3">
            <div className="h-6 bg-gray-300 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
          <div className="flex gap-2">
            {[1, 2].map((j) => (
              <div key={j} className="h-6 bg-gray-200 rounded-full w-24" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecommendationSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="h-5 bg-gray-300 rounded w-1/4 mb-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-6 bg-gray-300 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 rounded-lg p-6 mb-6">
        <div className="h-5 bg-gray-300 rounded w-1/3 mb-3" />
        <div className="flex items-center gap-4 mb-4">
          <div className="h-8 bg-emerald-300 rounded w-24" />
          <div className="flex-1 bg-gray-200 rounded-full h-4" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="h-5 bg-gray-300 rounded w-1/4 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}