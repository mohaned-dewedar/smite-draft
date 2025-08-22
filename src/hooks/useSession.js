import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export function useSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(false)
  const [sessionExists, setSessionExists] = useState(false)

  // Generate session ID and navigate to it
  const createSession = async (initialState) => {
    try {
      console.log('Creating session with initial state:', initialState)
      const newSessionId = crypto.randomUUID()
      console.log('Generated session ID:', newSessionId)
      
      const sessionData = {
        ...initialState,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours TTL
      }
      
      console.log('Saving session data:', sessionData)
      await setDoc(doc(db, 'sessions', newSessionId), sessionData)
      console.log('Session saved successfully, navigating...')
      
      navigate(`/draft/${newSessionId}`)
      return newSessionId
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  // Check if current session exists
  useEffect(() => {
    if (!sessionId) {
      setIsOnline(false)
      setSessionExists(false)
      return
    }

    const checkSession = async () => {
      const sessionDoc = await getDoc(doc(db, 'sessions', sessionId))
      setSessionExists(sessionDoc.exists())
      setIsOnline(sessionDoc.exists())
    }

    checkSession()
  }, [sessionId])

  return {
    sessionId,
    isOnline,
    sessionExists,
    createSession
  }
}