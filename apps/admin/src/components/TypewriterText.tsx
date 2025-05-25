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

  useEffect(() => {
    setDisplayText("")
    setIsComplete(false)
    let index = 0
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
        
        // Auto-scroll to keep the typing text in view
        if (textRef.current) {
          const rect = textRef.current.getBoundingClientRect()
          const isBelow = rect.bottom > window.innerHeight
          
          if (isBelow) {
            textRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'end' 
            })
          }
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
