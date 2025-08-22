import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://' + process.env.VERCEL_URL] 
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST']
  }
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'))
  })
}

// In-memory session storage for real-time state
const sessions = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join a draft session
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId)
    console.log(`User ${socket.id} joined session ${sessionId}`)
    
    // Initialize session if it doesn't exist
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        orderPicks: Array(5).fill(null),
        chaosPicks: Array(5).fill(null),
        orderBans: [],
        chaosBans: [],
        seqIndex: 0,
        actionHistory: []
      })
      console.log(`Initialized new session: ${sessionId}`)
    }
    
    // Send current session state
    socket.emit('session-state', sessions.get(sessionId))
  })

  // Handle draft actions (pick/ban)
  socket.on('draft-action', (data) => {
    const { sessionId, action } = data
    
    // Update session state
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        orderPicks: [],
        chaosPicks: [],
        orderBans: [],
        chaosBans: [],
        seqIndex: 0,
        actionHistory: []
      })
    }
    
    const sessionState = sessions.get(sessionId)
    
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
    
    sessions.set(sessionId, sessionState)
    
    // Broadcast to all clients in the session
    io.to(sessionId).emit('draft-update', sessionState)
    console.log(`Draft action broadcast to session ${sessionId}:`, action.type, action.god?.name)
  })

  // Handle sequence progression
  socket.on('next-turn', (data) => {
    const { sessionId, seqIndex } = data
    
    if (sessions.has(sessionId)) {
      const sessionState = sessions.get(sessionId)
      sessionState.seqIndex = seqIndex
      sessions.set(sessionId, sessionState)
      
      // Broadcast turn change
      io.to(sessionId).emit('turn-update', { seqIndex })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})