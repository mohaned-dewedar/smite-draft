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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Smite Draft — Interactive Prototype</h1>
          <div className="flex gap-2">
            <button 
              onClick={undoLastAction}
              disabled={actionHistory.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-semibold"
            >
              Undo (Backspace)
            </button>
            <button 
              onClick={resetDraft}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
            >
              Reset Draft
            </button>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Bans</h2>
          <div className="flex gap-6 mt-2">
            <BanList title="Order Bans" bans={orderBans} />
            <BanList title="Chaos Bans" bans={chaosBans} />
          </div>
        </div>

        <div className="mb-2">Turn: <span className="font-semibold">{current ? `${current.team} is ${current.action}ING` : 'Draft complete'}</span></div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div>
            <TeamPanel title="ORDER" picks={orderPicks} bans={orderBans} active={current?.team==='ORDER'} />
          </div>

          <div className="col-span-1 lg:col-span-3">
            <div className="bg-gray-800 rounded p-3">
            <FilterBar roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
            <GodGrid gods={gods} onSelectGod={onSelectGod} disabledIds={pickedOrBannedIds} roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
            </div>
          </div>

          <div>
            <TeamPanel title="CHAOS" picks={chaosPicks} bans={chaosBans} active={current?.team==='CHAOS'} rightAligned />
          </div>
        </div>
      </div>
    </div>
  )
}
