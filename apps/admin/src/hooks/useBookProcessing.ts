import { useState } from 'react'
import { ProcessingState, BookInfo } from '../types'

export const useBookProcessing = () => {
  const [state, setState] = useState<ProcessingState>("idle")
  const [progress, setProgress] = useState(0)
  const [response, setResponse] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null)

  const resetState = () => {
    setState("idle")
    setProgress(0)
    setResponse("")
    setError("")
    setBookInfo(null)
  }

  const updateProgress = (value: number) => {
    setProgress(value)
  }

  const updateState = (newState: ProcessingState) => {
    setState(newState)
  }

  const setBookResult = (info: BookInfo, description: string) => {
    setBookInfo(info)
    setResponse(description)
    setState("completed")
  }

  const setErrorResult = (errorMessage: string) => {
    setError(errorMessage)
    setState("error")
  }

  const isProcessing = ["uploading", "processing", "polling"].includes(state)

  return {
    state,
    progress,
    response,
    error,
    bookInfo,
    isProcessing,
    resetState,
    updateProgress,
    updateState,
    setBookResult,
    setErrorResult
  }
}
