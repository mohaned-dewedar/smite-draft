import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocketSync(sessionId, initialState) {
  const [state, setState] = useState(initialState)
  const [isLoading, setIsLoading] = useState(!!sessionId)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false)
      setIsConnected(false)
      return
    }

    // Connect to Socket.io server via Vercel API
    const serverUrl = window.location.origin
    console.log('🔗 Attempting to connect to:', serverUrl, 'with path: /api/socket')
    
    socketRef.current = io(serverUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling']
    })
    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('✅ Connected to draft server, socket ID:', socket.id)
      setIsConnected(true)
      setIsLoading(false)
      
      // Join the session room
      console.log('🏠 Joining session:', sessionId)
      socket.emit('join-session', sessionId)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from draft server, reason:', reason)
      setIsConnected(false)
    })

    // Receive session state when joining
    socket.on('session-state', (sessionState) => {
      console.log('📦 Received session state:', sessionState)
      setState(sessionState)
    })

    // Receive real-time draft updates
    socket.on('draft-update', (sessionState) => {
      console.log('🔄 Received draft update:', sessionState)
      setState(sessionState)
    })

    // Receive turn updates
    socket.on('turn-update', ({ seqIndex }) => {
      console.log('⏭️ Received turn update, new seqIndex:', seqIndex)
      setState(prev => ({ ...prev, seqIndex }))
    })

    socket.on('connect_error', (error) => {
      console.error('🚨 Socket connection error:', error)
      setIsLoading(false)
    })

    // Additional debugging events
    socket.on('connecting', () => {
      console.log('🔄 Socket connecting...')
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔁 Socket reconnected after', attemptNumber, 'attempts')
    })

    socket.on('reconnect_error', (error) => {
      console.error('🔁❌ Socket reconnect error:', error)
    })

    return () => {
      socket.disconnect()
    }
  }, [sessionId])

  // Function to send draft actions
  const sendDraftAction = (action) => {
    console.log('📤 Sending draft action:', action)
    if (socketRef.current && isConnected) {
      socketRef.current.emit('draft-action', {
        sessionId,
        action
      })
    } else {
      console.warn('⚠️ Cannot send draft action - socket not connected')
    }
  }

  // Function to advance turn
  const sendTurnUpdate = (seqIndex) => {
    console.log('📤 Sending turn update:', seqIndex)
    if (socketRef.current && isConnected) {
      socketRef.current.emit('next-turn', {
        sessionId,
        seqIndex
      })
    } else {
      console.warn('⚠️ Cannot send turn update - socket not connected')
    }
  }

  return { 
    state, 
    setState, 
    isLoading, 
    isConnected,
    sendDraftAction,
    sendTurnUpdate
  }
}