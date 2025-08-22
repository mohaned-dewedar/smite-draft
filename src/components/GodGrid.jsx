import React, {useState} from 'react'
import GodCard from './GodCard'

export default function GodGrid({gods, onSelectGod, disabledIds, roleFilter, setRoleFilter}){
  const [query, setQuery] = useState('')

  const filtered = gods.filter(g=>{
    // role can be array or string
    if(roleFilter && roleFilter !== 'All'){
      const roles = Array.isArray(g.role) ? g.role : (g.role ? [g.role] : [])
      if(!roles.map(r=>String(r).toLowerCase()).includes(roleFilter.toLowerCase())) return false
    }
    if(query && !g.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input className="flex-1 rounded px-3 py-2 lg:px-2 lg:py-1 bg-gray-900 border border-gray-700 text-sm lg:text-base" placeholder="Search gods..." value={query} onChange={e=>setQuery(e.target.value)} />
        <select className="bg-gray-900 border border-gray-700 rounded px-2 py-2 lg:py-1 text-sm lg:text-base min-w-0" value={roleFilter} onChange={e=>setRoleFilter && setRoleFilter(e.target.value)}>
          <option>All</option>
          <option>Carry</option>
          <option>Support</option>
          <option>Mid</option>
          <option>Jungle</option>
          <option>Solo</option>
        </select>
      </div>

  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-2 lg:gap-3 max-h-[60vh] lg:max-h-[72vh] overflow-auto">
        {filtered.map(g=> (
          <GodCard key={g.id} god={g} onClick={()=>onSelectGod(g)} disabled={disabledIds.has(g.id)} />
        ))}
      </div>
    </div>
  )
}
