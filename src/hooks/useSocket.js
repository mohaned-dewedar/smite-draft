import { useState, useEffect, useCallback } from 'react'
import { socket } from '../socket'

export function useSocket(roomId, userName) {
  const [connected, setConnected] = useState(false)
  const [roomData, setRoomData] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!roomId && !userName) return

    // Connect to socket
    socket.connect()

    // Socket event listeners
    const onConnect = () => {
      console.log('Socket connected!')
      setConnected(true)
      setError(null)
      // Only join room if roomId exists
      if (roomId) {
        socket.emit('join-room', { roomId, userName })
      }
    }

    const onDisconnect = () => {
      setConnected(false)
    }

    const onError = (error) => {
      setError(error.message || 'Connection error')
    }

    const onRoomUpdate = (data) => {
      setRoomData(data)
    }

    const onMessageReceived = (message) => {
      setMessages(prev => [...prev, message])
    }

    const onUsersUpdate = (usersData) => {
      setUsers(usersData)
    }

    const onRoomError = (error) => {
      setError(error)
    }

    const onRoomCreated = (data) => {
      console.log('🎉 Room created event received:', data)
      setRoomData(data.room)
      setUsers(data.room.users || [])
      console.log('✅ Room data set')
    }

    // Register listeners
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('error', onError)
    socket.on('room-updated', onRoomUpdate)
    socket.on('message-received', onMessageReceived)
    socket.on('users-updated', onUsersUpdate)
    socket.on('room-error', onRoomError)
    socket.on('room-created', onRoomCreated)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('error', onError)
      socket.off('room-updated', onRoomUpdate)
      socket.off('message-received', onMessageReceived)
      socket.off('users-updated', onUsersUpdate)
      socket.off('room-error', onRoomError)
      socket.off('room-created', onRoomCreated)
      // Don't disconnect socket as it might be reused
      // socket.disconnect()
    }
  }, [roomId, userName])

  const updateDraftState = useCallback((draftState) => {
    if (!connected) return
    
    socket.emit('update-draft', {
      roomId,
      draftState
    })
  }, [connected, roomId])

  const sendMessage = useCallback((message) => {
    if (!connected || !message.trim()) return

    socket.emit('send-message', {
      roomId,
      message: {
        text: message,
        author: userName,
        timestamp: Date.now()
      }
    })
  }, [connected, roomId, userName])

  const createRoom = useCallback((nameToUse) => {
    const name = nameToUse || userName
    console.log('Creating room for:', name, 'connected:', connected)
    
    // Always connect first, then emit after a short delay
    socket.connect()
    
    setTimeout(() => {
      console.log('Emitting create-room for:', name)
      socket.emit('create-room', { userName: name })
    }, 500) // Give socket time to connect
  }, [userName])

  return {
    connected,
    roomData,
    messages,
    users,
    error,
    updateDraftState,
    sendMessage,
    createRoom,
    createdRoomId: roomData?.id
  }
}