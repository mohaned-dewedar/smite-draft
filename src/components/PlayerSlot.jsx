import React from 'react'

export default function PlayerSlot({role, pick, index}){
  return (
    <div className="flex items-center bg-gray-700 rounded p-2">
      <div className="w-12 h-12 bg-gray-600 rounded overflow-hidden mr-3 flex-shrink-0">
        {pick ? <img src={pick.imageUrl} alt={pick.name} className="w-full h-full object-cover" /> : null}
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-300">{role}</div>
        <div className="font-medium">{pick ? pick.name : '—'}</div>
      </div>
    </div>
  )
}
