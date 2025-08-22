import React, {useState, useMemo, useEffect} from 'react'
import TeamPanel from './components/TeamPanel'
import GodGrid from './components/GodGrid'
import FilterBar from './components/FilterBar'
import BanList from './components/BanList'
import gods from './data/gods_merged_local.json'

// Draft sequence is configurable. For this scaffolding we use a simplified sequence:
// O = Order, C = Chaos, BAN/PICK
const DRAFT_SEQUENCE = [
  {team: 'ORDER', action: 'BAN'},
  {team: 'CHAOS', action: 'BAN'},
  {team: 'ORDER', action: 'BAN'},
  {team: 'CHAOS', action: 'BAN'},
  {team: 'ORDER', action: 'BAN'},
  {team: 'CHAOS', action: 'BAN'},
  {team: 'ORDER', action: 'Pick'},
  {team: 'CHAOS', action: 'Pick'},
  {team: 'CHAOS', action: 'Pick'},
  {team: 'ORDER', action: 'PICK'},
    {team: 'ORDER', action: 'PICK'},
  {team: 'CHAOS', action: 'PICK'},
  {team: 'CHAOS', action: 'PICK'},
  {team: 'ORDER', action: 'PICK'},
{team: 'ORDER', action: 'PICK'},    
  {team: 'CHAOS', action: 'PICK'}
]

export default function App(){
  // Minimal state to implement single-user draft flow
  const [orderPicks, setOrderPicks] = useState(Array(5).fill(null))
  const [chaosPicks, setChaosPicks] = useState(Array(5).fill(null))
  const [orderBans, setOrderBans] = useState([])
  const [chaosBans, setChaosBans] = useState([])
  const [seqIndex, setSeqIndex] = useState(0)
  const [actionHistory, setActionHistory] = useState([])

  const current = DRAFT_SEQUENCE[seqIndex]

  const [roleFilter, setRoleFilter] = useState('All')

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        undoLastAction()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actionHistory])

  const pickedOrBannedIds = useMemo(()=>{
    const ids = new Set()
    orderPicks.concat(chaosPicks).forEach(g=>{ if(g) ids.add(g.id) })
    orderBans.concat(chaosBans).forEach(g=>{ if(g) ids.add(g.id) })
    return ids
  },[orderPicks, chaosPicks, orderBans, chaosBans])

  function advance(){
    setSeqIndex(i=>Math.min(DRAFT_SEQUENCE.length-1, i+1))
  }

  function resetDraft(){
    setOrderPicks(Array(5).fill(null))
    setChaosPicks(Array(5).fill(null))
    setOrderBans([])
    setChaosBans([])
    setSeqIndex(0)
    setActionHistory([])
  }

  function undoLastAction(){
    if(actionHistory.length === 0) return
    
    const lastAction = actionHistory[actionHistory.length - 1]
    
    if(lastAction.action === 'BAN'){
      if(lastAction.team === 'ORDER'){
        setOrderBans(b => b.slice(0, -1))
      } else {
        setChaosBans(b => b.slice(0, -1))
      }
    } else {
      // PICK action
      if(lastAction.team === 'ORDER'){
        setOrderPicks(p => {
          const next = [...p]
          next[lastAction.slotIndex] = null
          return next
        })
      } else {
        setChaosPicks(p => {
          const next = [...p]
          next[lastAction.slotIndex] = null
          return next
        })
      }
    }
    
    setActionHistory(h => h.slice(0, -1))
    setSeqIndex(i => Math.max(0, i - 1))
  }

  function onSelectGod(god){
    if(!current) return
    if(pickedOrBannedIds.has(god.id)) return

    let actionRecord = {
      action: current.action,
      team: current.team,
      god: god
    }

    if(current.action === 'BAN'){
      if(current.team === 'ORDER') setOrderBans(b=>[...b, god])
      else setChaosBans(b=>[...b, god])
    } else {
      // place pick in next empty slot of that team
      if(current.team === 'ORDER'){
        setOrderPicks(p=>{
          const next = [...p]
          const idx = next.findIndex(x=>x===null)
          if(idx !== -1) {
            next[idx] = god
            actionRecord.slotIndex = idx
          }
          return next
        })
      } else {
        setChaosPicks(p=>{
          const next = [...p]
          const idx = next.findIndex(x=>x===null)
          if(idx !== -1) {
            next[idx] = god
            actionRecord.slotIndex = idx
          }
          return next
        })
      }
    }

    setActionHistory(h => [...h, actionRecord])

    // advance turn after selection
    setTimeout(advance, 250)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Smite Draft Tool
            </h1>
            <p className="text-gray-400 mt-1">Conquest Draft</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={undoLastAction}
              disabled={actionHistory.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              ↶ Undo
            </button>
            <button 
              onClick={resetDraft}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25"
            >
              🔄 Reset
            </button>
          </div>
        </header>
        {/* Draft Status */}
        <section className="text-center mb-6" aria-live="polite" aria-label="Draft Status">
          <div className="inline-flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-full border border-gray-700">
            {current ? (
              <>
                <div className={`w-3 h-3 rounded-full ${current.team === 'ORDER' ? 'bg-blue-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-lg font-medium">
                  <span className={current.team === 'ORDER' ? 'text-blue-400' : 'text-red-400'}>
                    {current.team}
                  </span>
                  <span className="text-gray-300 mx-2">is</span>
                  <span className="text-yellow-400 font-semibold">
                    {current.action === 'BAN' ? 'BANNING' : 'PICKING'}
                  </span>
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-lg font-medium text-green-400">Draft Complete!</span>
              </>
            )}
          </div>
        </section>

        {/* Ban Section */}
        <section className="mb-8" aria-labelledby="banned-gods-heading">
          <h2 id="banned-gods-heading" className="text-xl font-semibold mb-4 text-center">Banned Gods</h2>
          <div className="flex gap-6 justify-center">
            <BanList title="Order Bans" bans={orderBans} />
            <BanList title="Chaos Bans" bans={chaosBans} />
          </div>
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-6" role="main">
          <aside className="lg:col-span-1" aria-label="Order team">
            <TeamPanel title="ORDER" picks={orderPicks} bans={orderBans} active={current?.team==='ORDER'} />
          </aside>

          <section className="col-span-1 lg:col-span-3" aria-labelledby="god-selection-heading">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 shadow-xl">
              <h2 id="god-selection-heading" className="sr-only">God Selection</h2>
              <FilterBar roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
              <GodGrid gods={gods} onSelectGod={onSelectGod} disabledIds={pickedOrBannedIds} roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
            </div>
          </section>

          <aside className="lg:col-span-1" aria-label="Chaos team">
            <TeamPanel title="CHAOS" picks={chaosPicks} bans={chaosBans} active={current?.team==='CHAOS'} rightAligned />
          </aside>
        </main>
      </div>
    </div>
  )
}
