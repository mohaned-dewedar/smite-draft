import React from 'react'

export default function FilterBar({roleFilter, setRoleFilter}){
  const roles = ['All','Carry','Support','Mid','Jungle','Solo']
  return (
    <div className="mb-3 flex gap-2">
      {roles.map(r=> (
        <button key={r} onClick={()=>setRoleFilter(r)} className={`px-2 py-1 rounded ${roleFilter===r ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`}>{r}</button>
      ))}
    </div>
  )
}
