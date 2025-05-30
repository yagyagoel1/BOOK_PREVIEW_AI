import { useState, useEffect, useRef } from 'react'

const ENCOURAGING_MESSAGES = [
  "Working on your image...",
  "Don't worry, it's processing!",
  "How was your day? :)",
  "Almost there, just a bit more...",
  "Great choice of book!",
  "Processing magic happening...",
  "Patience is a virtue!",
  "Quality analysis takes time...",
  "Your book is worth the wait!",
  "AI is thinking hard about this...",
  "Good things come to those who wait!",
  "Book identification in progress..."
]

const STATIC_TIMEOUT = 20000 
const MESSAGE_CHANGE_INTERVAL = 15000 

export const useStatusBarMessages = (currentMessage: string, isActive: boolean) => {
  const [displayMessage, setDisplayMessage] = useState<string>(currentMessage)
  const [isShowingEncouragement, setIsShowingEncouragement] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMessageRef = useRef<string>(currentMessage)

  const getRandomMessage = () => {
    return ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)]
  }

  const startEncouragementCycle = () => {
    console.log('Starting encouragement cycle')
    setIsShowingEncouragement(true)
    
    // Set first random message immediately
    setDisplayMessage(getRandomMessage())
    
    // Start cycling through random messages every 20 seconds
    intervalRef.current = setInterval(() => {
      setDisplayMessage(getRandomMessage())
    }, MESSAGE_CHANGE_INTERVAL)
  }

  const stopEncouragementCycle = () => {
    console.log('Stopping encouragement cycle')
    setIsShowingEncouragement(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  useEffect(() => {
    console.log('Effect triggered:', { currentMessage, isActive, isShowingEncouragement })
    
    // If not active, clear everything and use current message
    if (!isActive) {
      stopEncouragementCycle()
      setDisplayMessage(currentMessage)
      lastMessageRef.current = currentMessage
      return
    }

    // If message changed, stop encouragement and reset
    if (currentMessage !== lastMessageRef.current) {
      console.log('Message changed from', lastMessageRef.current, 'to', currentMessage)
      stopEncouragementCycle()
      setDisplayMessage(currentMessage)
      lastMessageRef.current = currentMessage
      
      // Start new timeout for static message detection
      if (currentMessage) { // Only start timeout if there's a message
        console.log('Starting timeout for new message')
        timeoutRef.current = setTimeout(() => {
          console.log('Timeout triggered for message:', currentMessage)
          if (isActive && currentMessage === lastMessageRef.current) {
            startEncouragementCycle()
          }
        }, STATIC_TIMEOUT)
      }
    }
    // If message hasn't changed and we're not already showing encouragement
    else if (!isShowingEncouragement && currentMessage) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Start timeout for this message
      console.log('Starting timeout for existing message')
      timeoutRef.current = setTimeout(() => {
        console.log('Timeout triggered for existing message:', currentMessage)
        if (isActive && currentMessage === lastMessageRef.current) {
          startEncouragementCycle()
        }
      }, STATIC_TIMEOUT)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentMessage, isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopEncouragementCycle()
    }
  }, [])

  return {
    displayMessage,
    isShowingEncouragement
  }
}
