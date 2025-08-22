import { useParams, useNavigate } from 'react-router-dom'

export function useSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const isOnline = !!sessionId

  // Generate session ID and navigate to it
  const createSession = async (initialState) => {
    try {
      console.log('Creating session with initial state:', initialState)
      const newSessionId = crypto.randomUUID()
      console.log('Generated session ID:', newSessionId)
      
      navigate(`/draft/${newSessionId}`)
      return newSessionId
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  return {
    sessionId,
    isOnline,
    createSession
  }
}