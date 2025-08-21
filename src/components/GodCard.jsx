import React, {useState, useEffect} from 'react'

export default function GodCard({god, onClick, disabled}){
  const safeName = (god && god.name) ? god.name.replace(/[^a-z0-9]+/gi,'_').toLowerCase() : 'unknown'
  const localSvg = `/assets/gods/${safeName}.svg`
  const localPng = `/assets/gods/${safeName}.png`
  const remote = god && god.imageUrl ? god.imageUrl : null

  // start with local svg unless the entry already points to an asset
  const initial = (remote && remote.startsWith('/assets/')) ? remote : localSvg
  const [src, setSrc] = useState(initial)

  useEffect(()=>{
    const next = (remote && remote.startsWith('/assets/')) ? remote : localSvg
    setSrc(next)
  }, [god])

  function handleError(){
    // fallback chain: local svg -> local png -> original remote URL -> give up
    if(src === localSvg){
      setSrc(localPng)
    } else if(src === localPng){
      if(remote && !remote.startsWith('/assets/')) setSrc(remote)
      else setSrc(localPng) // last resort, keep png (browser will show broken image if missing)
    } else {
      // already tried remote, nothing left to do
    }
  }

  return (
    <button onClick={onClick} disabled={disabled} className={`group relative rounded overflow-hidden border ${disabled? 'opacity-40 cursor-not-allowed border-gray-700':'border-transparent hover:scale-105 transform transition'} bg-gray-800` }>
  <img src={src} alt={god.name} className="w-full h-32 object-cover" onError={handleError} />
      <div className="p-1 text-xs text-center">{god.name}</div>
      {disabled && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-sm">Unavailable</div>}
    </button>
  )
}
