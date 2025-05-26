import { useState, useEffect, useRef } from "react"

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
}

export function TypewriterText({ text, speed = 50, className = "" }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)
  const hasScrolledToStart = useRef(false)

  useEffect(() => {
    setDisplayText("")
    setIsComplete(false)
    hasScrolledToStart.current = false
    let index = 0
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
        
        if (!hasScrolledToStart.current && textRef.current) {
          textRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
          hasScrolledToStart.current = true
        }
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <div ref={textRef} className={`${className} font-mono`}>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </div>
  )
}
