import React from 'react'

export default function BanList({ title, bans, containerClass = "" }) {
  const isOrder = title.includes('Order')
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 flex-1 min-w-72 border border-gray-700 shadow-xl">
      <h4 className={`font-bold mb-4 text-center text-lg ${isOrder ? 'text-blue-400' : 'text-red-400'}`}>
        {title}
      </h4>
      <div className={`flex gap-3 justify-center ${containerClass}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="relative group">
            <div className="w-20 h-20 bg-gray-700/50 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-600/50 transition-all duration-200 group-hover:border-gray-500">
              {bans[i] ? (
                <>
                  <img 
                    src={bans[i].imageUrl} 
                    alt={bans[i].name} 
                    className="w-full h-full object-cover filter grayscale" 
                  />
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <div className="text-red-500 text-2xl font-bold transform rotate-12">✕</div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">Empty</div>
              )}
            </div>
            {bans[i] && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {bans[i].name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
