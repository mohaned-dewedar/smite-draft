import React from 'react'

export default function BanList({ title, bans, containerClass = "" }) {
  return (
    <div className="bg-gray-800 rounded p-4 flex-1 min-w-64">
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className={`flex gap-2 w-max ${containerClass}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-16 h-16 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
            {bans[i] ? (
              <img src={bans[i].imageUrl} alt={bans[i].name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-gray-400">—</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
