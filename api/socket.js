import { Server } from 'socket.io'
import { kv } from '@vercel/kv'

let io

export default function handler(req, res) {
  console.log('🚀 Socket.io handler called:', req.method, req.url)
  
  if (!res.socket.server.io) {
    console.log('📡 Initializing Socket.io server...')
    io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    console.log('✅ Socket.io server initialized')

    io.on('connection', (socket) => {
      console.log('🔌 User connected:', socket.id)

      // Join a draft session
      socket.on('join-session', async (sessionId) => {
        try {
          socket.join(sessionId)
          console.log(`🏠 User ${socket.id} joined session ${sessionId}`)
          
          // Get session state from Vercel KV
          console.log(`🔍 Getting session state for: ${sessionId}`)
          let sessionState = await kv.get(`session:${sessionId}`)
          console.log('📦 KV result:', sessionState ? 'Found existing session' : 'No session found')
          
          // Initialize session if it doesn't exist
          if (!sessionState) {
            sessionState = {
              orderPicks: Array(5).fill(null),
              chaosPicks: Array(5).fill(null),
              orderBans: [],
              chaosBans: [],
              seqIndex: 0,
              actionHistory: []
            }
            console.log('💾 Saving new session to KV...')
            await kv.set(`session:${sessionId}`, sessionState)
            console.log(`✅ Initialized new session: ${sessionId}`)
          }
          
          // Send current session state
          console.log('📤 Sending session state to client')
          socket.emit('session-state', sessionState)
        } catch (error) {
          console.error('❌ Error in join-session:', error)
        }
      })

      // Handle draft actions (pick/ban)
      socket.on('draft-action', async (data) => {
        const { sessionId, action } = data
        
        // Get current session state
        let sessionState = await kv.get(`session:${sessionId}`)
        if (!sessionState) return
        
        // Apply the action to session state
        if (action.type === 'pick') {
          if (action.team === 'order') {
            sessionState.orderPicks[action.slot] = action.god
          } else {
            sessionState.chaosPicks[action.slot] = action.god
          }
        } else if (action.type === 'ban') {
          if (action.team === 'order') {
            sessionState.orderBans.push(action.god)
          } else {
            sessionState.chaosBans.push(action.god)
          }
        }
        
        // Update sequence index and history
        sessionState.seqIndex = action.seqIndex || sessionState.seqIndex
        sessionState.actionHistory.push(action)
        
        // Save updated state to KV
        await kv.set(`session:${sessionId}`, sessionState)
        
        // Broadcast to all clients in the session
        io.to(sessionId).emit('draft-update', sessionState)
        console.log(`Draft action broadcast to session ${sessionId}:`, action.type, action.god?.name)
      })

      // Handle sequence progression
      socket.on('next-turn', async (data) => {
        const { sessionId, seqIndex } = data
        
        let sessionState = await kv.get(`session:${sessionId}`)
        if (sessionState) {
          sessionState.seqIndex = seqIndex
          await kv.set(`session:${sessionId}`, sessionState)
          
          // Broadcast turn change
          io.to(sessionId).emit('turn-update', { seqIndex })
        }
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
  } else {
    console.log('♻️ Socket.io server already exists')
    io = res.socket.server.io
  }
  
  console.log('✅ Handler completed')
  res.end()
}