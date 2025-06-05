interface InvestorCardProps {
  name: string;
  title: string;
  philosophy: string;
  imageUrl?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export default function InvestorCard({ 
  name, 
  title, 
  philosophy, 
  imageUrl, 
  selected = false,
  onSelect 
}: InvestorCardProps) {
  return (
    <div 
      onClick={onSelect}
      className={`
        relative border-2 rounded-xl p-6 transition-all cursor-pointer
        ${selected 
          ? 'border-emerald-500 bg-emerald-50 shadow-lg transform scale-105' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-gray-600">{name.charAt(0)}</span>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-gray-700 line-clamp-3">{philosophy}</p>
        </div>
      </div>
    </div>
  );
}