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

    // Connect to Socket.io server
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin
      : 'http://localhost:3001'
    
    socketRef.current = io(serverUrl)
    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Connected to draft server')
      setIsConnected(true)
      setIsLoading(false)
      
      // Join the session room
      socket.emit('join-session', sessionId)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from draft server')
      setIsConnected(false)
    })

    // Receive session state when joining
    socket.on('session-state', (sessionState) => {
      console.log('Received session state:', sessionState)
      setState(sessionState)
    })

    // Receive real-time draft updates
    socket.on('draft-update', (sessionState) => {
      console.log('Received draft update:', sessionState)
      setState(sessionState)
    })

    // Receive turn updates
    socket.on('turn-update', ({ seqIndex }) => {
      setState(prev => ({ ...prev, seqIndex }))
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsLoading(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [sessionId])

  // Function to send draft actions
  const sendDraftAction = (action) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('draft-action', {
        sessionId,
        action
      })
    }
  }

  // Function to advance turn
  const sendTurnUpdate = (seqIndex) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('next-turn', {
        sessionId,
        seqIndex
      })
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