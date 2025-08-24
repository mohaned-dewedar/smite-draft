import React, {useState, useMemo, useEffect} from 'react'
import TeamPanel from './components/TeamPanel'
import GodGrid from './components/GodGrid'
import FilterBar from './components/FilterBar'
import BanList from './components/BanList'
import RoomLobby from './components/RoomLobby'
import Chat from './components/Chat'
import UsersList from './components/UsersList'
import JoinRoomModal from './components/JoinRoomModal'
import { useSocket } from './hooks/useSocket'
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
  {team: 'ORDER', action: 'PICK'},
  {team: 'CHAOS', action: 'PICK'},
  {team: 'CHAOS', action: 'PICK'},
  {team: 'ORDER', action: 'PICK'},
  {team: 'ORDER', action: 'PICK'},
  {team: 'CHAOS', action: 'PICK'},
  {team: 'CHAOS', action: 'PICK'},
  {team: 'ORDER', action: 'PICK'},
  {team: 'ORDER', action: 'PICK'},
  {team: 'CHAOS', action: 'PICK'}
]

export default function App(){
  // Room and user state (null = single-player mode)
  const [roomId, setRoomId] = useState(null)
  const [userName, setUserName] = useState('')
  const [showRoomCreation, setShowRoomCreation] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  
  // Local draft state
  const [orderPicks, setOrderPicks] = useState(Array(5).fill(null))
  const [chaosPicks, setChaosPicks] = useState(Array(5).fill(null))
  const [orderBans, setOrderBans] = useState([])
  const [chaosBans, setChaosBans] = useState([])
  const [seqIndex, setSeqIndex] = useState(0)
  const [actionHistory, setActionHistory] = useState([])

  // Socket connection (only when in multiplayer mode)
  const {
    connected,
    roomData,
    messages,
    users,
    error,
    updateDraftState,
    sendMessage,
    createRoom,
    createdRoomId
  } = useSocket(roomId, userName)

  const current = DRAFT_SEQUENCE[seqIndex]

  const [roleFilter, setRoleFilter] = useState('All')

  // Sync room data to local state
  useEffect(() => {
    if (roomData?.draftState) {
      setIsSyncing(true) // Prevent local-to-server sync during server-to-local sync
      
      const { orderPicks, chaosPicks, orderBans, chaosBans, seqIndex, actionHistory } = roomData.draftState
      setOrderPicks(orderPicks || Array(5).fill(null))
      setChaosPicks(chaosPicks || Array(5).fill(null))
      setOrderBans(orderBans || [])
      setChaosBans(chaosBans || [])
      setSeqIndex(seqIndex || 0)
      setActionHistory(actionHistory || [])
      
      // Allow local changes after sync is complete
      setTimeout(() => setIsSyncing(false), 100)
    }
  }, [roomData])

  // Track if we're syncing from server to prevent loops
  const [isSyncing, setIsSyncing] = useState(false)

  // Sync local draft state to room when user makes changes (not when receiving from server)
  useEffect(() => {
    if (roomId && !isSyncing) {
      const draftState = {
        orderPicks,
        chaosPicks,
        orderBans,
        chaosBans,
        seqIndex,
        actionHistory
      }
      updateDraftState(draftState)
    }
  }, [orderPicks, chaosPicks, orderBans, chaosBans, seqIndex, actionHistory, roomId, updateDraftState, isSyncing])

  // Room management functions
  const handleJoinRoom = async ({ roomId, userName }) => {
    setRoomId(roomId)
    setUserName(userName)
    // Socket connection will happen in useSocket hook
  }

  const handleCreateRoom = async ({ userName }) => {
    console.log('handleCreateRoom called with:', userName)
    setUserName(userName)
    
    // Pass userName directly to createRoom
    console.log('Calling createRoom...')
    createRoom(userName)
  }

  // Handle room creation response
  useEffect(() => {
    console.log('Effect triggered:', { createdRoomId, roomId })
    if (createdRoomId && !roomId) {
      console.log('Setting room ID:', createdRoomId)
      setRoomId(createdRoomId)
    }
  }, [createdRoomId, roomId])

  // Check URL parameters for room code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomParam = urlParams.get('room')
    if (roomParam && !roomId) {
      joinRoomById(roomParam)
    }
  }, [])

  const leaveRoom = () => {
    setRoomId(null)
    setUserName('')
    // Reset draft state
    resetDraft()
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        // Don't trigger undo if user is typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
          return
        }
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
    
    // In single-player mode or multiplayer, anyone can draft

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

  // Create shareable room function
  const createShareableRoom = () => {
    console.log('Creating shareable room...')
    setShowRoomCreation(true)
    const defaultName = `Player${Math.floor(Math.random() * 1000)}`
    console.log('Using name:', defaultName)
    handleCreateRoom({ userName: defaultName })
  }

  const joinRoomById = (roomCode) => {
    const defaultName = `Player${Math.floor(Math.random() * 1000)}`
    handleJoinRoom({ roomId: roomCode, userName: defaultName })
  }

  const copyRoomUrl = () => {
    const url = `${window.location.origin}?room=${roomId}`
    navigator.clipboard.writeText(url)
    alert('Room URL copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-3 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Smite Draft Tool
            </h1>
            {roomId ? (
              <div className="flex items-center gap-4 mt-1">
                <p className="text-gray-400 text-sm lg:text-base">
                  Room: <span className="text-blue-400 font-mono">{roomId}</span>
                </p>
                <p className="text-gray-400 text-sm lg:text-base">
                  {users.length} user{users.length !== 1 ? 's' : ''} connected
                </p>
              </div>
            ) : (
              <p className="text-gray-400 mt-1 text-sm lg:text-base">Single Player Mode</p>
            )}
          </div>
          <div className="flex gap-2 lg:gap-3 w-full sm:w-auto">
            <button 
              onClick={undoLastAction}
              disabled={actionHistory.length === 0}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 text-sm lg:text-base"
            >
              ↶ Undo
            </button>
            <button 
              onClick={resetDraft}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 text-sm lg:text-base"
            >
              🔄 Reset
            </button>
            {roomId ? (
              <>
                <button 
                  onClick={copyRoomUrl}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base"
                >
                  📋 Copy Link
                </button>
                <button 
                  onClick={leaveRoom}
                  className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base"
                >
                  🚪 Leave
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={createShareableRoom}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 text-sm lg:text-base"
                >
                  🔗 Share Draft
                </button>
                <button 
                  onClick={() => setShowJoinModal(true)}
                  className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 text-sm lg:text-base"
                >
                  🚀 Join Room
                </button>
              </>
            )}
          </div>
        </header>
        {/* Draft Status */}
        <section className="text-center mb-4 lg:mb-6" aria-live="polite" aria-label="Draft Status">
          <div className="inline-flex items-center gap-2 bg-gray-800 px-4 lg:px-6 py-2 lg:py-3 rounded-full border border-gray-700">
            {current ? (
              <>
                <div className={`w-3 h-3 rounded-full ${current.team === 'ORDER' ? 'bg-blue-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-base lg:text-lg font-medium">
                  <span className={current.team === 'ORDER' ? 'text-blue-400' : 'text-red-400'}>
                    {current.team}
                  </span>
                  <span className="text-gray-300 mx-1 lg:mx-2">is</span>
                  <span className="text-yellow-400 font-semibold">
                    {current.action === 'BAN' ? 'BANNING' : 'PICKING'}
                  </span>
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-base lg:text-lg font-medium text-green-400">Draft Complete!</span>
              </>
            )}
          </div>
        </section>

        {/* Ban Section */}
        <section className="mb-6 lg:mb-8" aria-labelledby="banned-gods-heading">
          <h2 id="banned-gods-heading" className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-center">Banned Gods</h2>
          <div className="flex gap-3 lg:gap-6 justify-center">
            <BanList title="Order Bans" bans={orderBans} />
            <BanList title="Chaos Bans" bans={chaosBans} />
          </div>
        </section>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Current Team Status - Mobile */}
          <div className="flex gap-4">
            <div className="flex-1">
              <TeamPanel title="ORDER" picks={orderPicks} bans={orderBans} active={current?.team==='ORDER'} />
            </div>
            <div className="flex-1">
              <TeamPanel title="CHAOS" picks={chaosPicks} bans={chaosBans} active={current?.team==='CHAOS'} rightAligned />
            </div>
          </div>

          {/* Multiplayer Features - Mobile */}
          {roomId && <UsersList users={users} connected={connected} />}
          
          {/* God Selection - Mobile */}
          <section aria-labelledby="god-selection-heading">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 shadow-xl">
              <h2 id="god-selection-heading" className="sr-only">God Selection</h2>
              <FilterBar roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
              <GodGrid gods={gods} onSelectGod={onSelectGod} disabledIds={pickedOrBannedIds} roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
            </div>
          </section>

          {/* Chat - Mobile */}
          {roomId && <Chat messages={messages} onSendMessage={sendMessage} connected={connected} />}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <main className="grid lg:grid-cols-6 gap-6 mb-6" role="main">
            <aside className="lg:col-span-1" aria-label="Order team">
              <div className="space-y-4">
                <TeamPanel title="ORDER" picks={orderPicks} bans={orderBans} active={current?.team==='ORDER'} />
                {roomId && <UsersList users={users} connected={connected} />}
              </div>
            </aside>

            <section className="col-span-1 lg:col-span-4" aria-labelledby="god-selection-heading-desktop">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 shadow-xl">
                <h2 id="god-selection-heading-desktop" className="sr-only">God Selection</h2>
                <FilterBar roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
                <GodGrid gods={gods} onSelectGod={onSelectGod} disabledIds={pickedOrBannedIds} roleFilter={roleFilter} setRoleFilter={setRoleFilter} />
              </div>
            </section>

            <aside className="lg:col-span-1" aria-label="Chaos team">
              <TeamPanel title="CHAOS" picks={chaosPicks} bans={chaosBans} active={current?.team==='CHAOS'} rightAligned />
            </aside>
          </main>

          {/* Chat - Desktop */}
          {roomId && (
            <div className="max-w-2xl mx-auto">
              <Chat messages={messages} onSendMessage={sendMessage} connected={connected} />
            </div>
          )}
        </div>
      </div>
      
      {/* Join Room Modal */}
      {showJoinModal && (
        <JoinRoomModal
          onClose={() => setShowJoinModal(false)}
          onJoin={joinRoomById}
        />
      )}
    </div>
  )
}
