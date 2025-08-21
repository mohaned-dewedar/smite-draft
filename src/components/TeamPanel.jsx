import React from 'react'
import PlayerSlot from './PlayerSlot'

export default function TeamPanel({title, picks, bans, active, rightAligned}){
  return (
    <div className={`bg-gray-800 rounded p-3 h-full ${rightAligned? 'text-right':''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold">{title}</h3>
        {active && <div className="text-sm text-yellow-300">ACTIVE</div>}
      </div>

      <div className="space-y-2">
        {Array.from({length:5}).map((_,i)=> (
          <PlayerSlot key={i} role={["Solo","Jungle","Mid","Carry","Support"][i]} pick={picks[i]} index={i} />
        ))}
      </div>

    </div>
  )
}
