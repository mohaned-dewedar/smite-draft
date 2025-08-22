import { useState, useEffect } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function useDraftSync(sessionId, initialState) {
  const [state, setState] = useState(initialState)
  const [isLoading, setIsLoading] = useState(!!sessionId)

  // Subscribe to Firestore updates when in a session
  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false)
      return
    }

    const unsubscribe = onSnapshot(doc(db, 'sessions', sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setState({
          orderPicks: data.orderPicks || initialState.orderPicks,
          chaosPicks: data.chaosPicks || initialState.chaosPicks,
          orderBans: data.orderBans || initialState.orderBans,
          chaosBans: data.chaosBans || initialState.chaosBans,
          seqIndex: data.seqIndex || initialState.seqIndex,
          actionHistory: data.actionHistory || initialState.actionHistory
        })
      }
      setIsLoading(false)
    })

    return unsubscribe
  }, [sessionId])

  // Update Firestore when state changes (debounced)
  useEffect(() => {
    if (!sessionId || isLoading) return

    const timeoutId = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'sessions', sessionId), {
          ...state,
          updatedAt: new Date()
        })
      } catch (error) {
        console.error('Failed to sync state:', error)
      }
    }, 100) // 100ms debounce

    return () => clearTimeout(timeoutId)
  }, [sessionId, state, isLoading])

  return { state, setState, isLoading }
}