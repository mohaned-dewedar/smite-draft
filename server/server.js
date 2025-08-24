const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = createServer(app)

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

// In-memory storage (use Redis/database in production)
const rooms = new Map()
const users = new Map()

// Utility functions
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function createRoom(roomId, creator) {
  const room = {
    id: roomId,
    created: Date.now(),
    draftState: {
      orderPicks: Array(5).fill(null),
      chaosPicks: Array(5).fill(null),
      orderBans: [],
      chaosBans: [],
      seqIndex: 0,
      actionHistory: []
    },
    messages: [],
    users: [creator]
  }
  rooms.set(roomId, room)
  return room
}

function addUserToRoom(roomId, user) {
  const room = rooms.get(roomId)
  if (!room) return null
  
  // Remove user from existing position if already in room
  room.users = room.users.filter(u => u.socketId !== user.socketId)
  
  // Add user to room
  room.users.push(user)
  return room
}

function removeUserFromRoom(roomId, socketId) {
  const room = rooms.get(roomId)
  if (!room) return null
  
  room.users = room.users.filter(u => u.socketId !== socketId)
  
  // Clean up empty rooms
  if (room.users.length === 0) {
    rooms.delete(roomId)
    return null
  }
  
  return room
}

function getRoomUsers(room) {
  return room.users.map(user => ({
    name: user.name,
    connected: true
  }))
}


// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)
  
  users.set(socket.id, {
    socketId: socket.id,
    connected: true
  })

  // Handle room creation
  socket.on('create-room', (data) => {
    try {
      let roomId
      do {
        roomId = generateRoomId()
      } while (rooms.has(roomId))

      const creator = {
        socketId: socket.id,
        name: data.userName,
        joinedAt: Date.now()
      }

      const room = createRoom(roomId, creator)
      socket.join(roomId)
      
      // Update user info
      const user = users.get(socket.id)
      user.roomId = roomId
      user.name = data.userName

      // Send room created event
      socket.emit('room-created', {
        roomId: roomId,
        room: {
          ...room,
          users: getRoomUsers(room)
        }
      })

      console.log(`Room created: ${roomId} by ${data.userName}`)
    } catch (error) {
      socket.emit('room-error', 'Failed to create room')
    }
  })

  // Handle joining room
  socket.on('join-room', (data) => {
    try {
      const { roomId, userName } = data
      
      if (!rooms.has(roomId)) {
        socket.emit('room-error', 'Room not found')
        return
      }

      const user = {
        socketId: socket.id,
        name: userName,
        joinedAt: Date.now()
      }

      const updatedRoom = addUserToRoom(roomId, user)
      if (!updatedRoom) {
        socket.emit('room-error', 'Failed to join room')
        return
      }

      socket.join(roomId)
      
      // Update user info
      const userInfo = users.get(socket.id)
      userInfo.roomId = roomId
      userInfo.name = userName

      // Send room data to user
      socket.emit('room-updated', {
        ...updatedRoom,
        users: getRoomUsers(updatedRoom)
      })

      // Notify other users in room
      socket.to(roomId).emit('users-updated', getRoomUsers(updatedRoom))
      socket.to(roomId).emit('message-received', {
        text: `${userName} joined the room`,
        author: 'System',
        timestamp: Date.now()
      })

      console.log(`${userName} joined room ${roomId}`)
    } catch (error) {
      socket.emit('room-error', 'Failed to join room')
    }
  })

  // Handle draft state updates
  socket.on('update-draft', (data) => {
    try {
      const user = users.get(socket.id)
      if (!user || !user.roomId) return

      const room = rooms.get(user.roomId)
      if (!room) return

      // All users in room can update draft state

      room.draftState = data.draftState
      room.lastUpdated = Date.now()

      // Broadcast to all users in room
      io.to(user.roomId).emit('room-updated', {
        ...room,
        users: getRoomUsers(room)
      })

      console.log(`Draft updated in room ${user.roomId} by ${user.name}`)
    } catch (error) {
      console.error('Error updating draft:', error)
    }
  })

  // Handle chat messages
  socket.on('send-message', (data) => {
    try {
      const user = users.get(socket.id)
      if (!user || !user.roomId) return

      const room = rooms.get(user.roomId)
      if (!room) return

      const message = {
        ...data.message,
        timestamp: Date.now()
      }

      room.messages.push(message)
      
      // Keep only last 100 messages
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100)
      }

      // Broadcast message to all users in room
      io.to(user.roomId).emit('message-received', message)

      console.log(`Message in room ${user.roomId} from ${user.name}: ${message.text}`)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  })


  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      const user = users.get(socket.id)
      if (user && user.roomId) {
        const room = removeUserFromRoom(user.roomId, socket.id)
        
        if (room) {
          // Notify remaining users
          socket.to(user.roomId).emit('users-updated', getRoomUsers(room))
          socket.to(user.roomId).emit('message-received', {
            text: `${user.name} left the room`,
            author: 'System',
            role: 'system',
            timestamp: Date.now()
          })
        }

        console.log(`${user.name} left room ${user.roomId}`)
      }

      users.delete(socket.id)
      console.log(`User disconnected: ${socket.id}`)
    } catch (error) {
      console.error('Error handling disconnect:', error)
    }
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size, 
    users: users.size,
    timestamp: new Date().toISOString()
  })
})

// Get room info endpoint
app.get('/room/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId.toUpperCase())
  if (!room) {
    return res.status(404).json({ error: 'Room not found' })
  }
  
  res.json({
    id: room.id,
    created: room.created,
    userCount: room.users.length,
    hasMessages: room.messages.length > 0
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 Smite Draft Server running on port ${PORT}`)
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`)
})