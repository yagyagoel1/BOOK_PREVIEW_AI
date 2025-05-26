import { useState } from 'react'
import { ProcessingState, StatusObject } from '../types'
import { BookProcessingService } from '../services/BookProcessingService'

export const useBookProcessing = () => {
  const [state, setState] = useState<ProcessingState>("idle")
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [bookData, setBookData] = useState<StatusObject['data'] | null>(null)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  const resetState = () => {
    setState("idle")
    setProgress(0)
    setStatusMessage("")
    setError("")
    setBookData(null)
    setCurrentJobId(null)
  }

  const updateProgress = (value: number) => {
    setProgress(value)
  }

  const updateState = (newState: ProcessingState) => {
    setState(newState)
  }

  const processBookImage = async (file: File) => {
    try {
      resetState()
      setState("uploading")
      setProgress(10)

      // Upload the image
      const uploadResult = await BookProcessingService.uploadBookImage(file)
      
      if (!uploadResult.success || !uploadResult.jobId) {
        setError(uploadResult.error || 'Upload failed')
        setState("error")
        return
      }

      setCurrentJobId(uploadResult.jobId)
      setState("processing")
      setProgress(20)

      // Start polling for job status
      setState("polling")
      BookProcessingService.pollJobStatus(
        uploadResult.jobId,
        (status: StatusObject, progressPercentage: number) => {
          // On progress update
          setStatusMessage(status.message)
          setProgress(progressPercentage)
          
          if (status.status === 'retrying') {
            setState("retrying")
            setProgress(0) // Reset progress on retry
          } else if (status.status === 'pending') {
            setState("polling")
          }
        },
        (status: StatusObject) => {
          // On completion
          if (status.data) {
            setBookData(status.data)
            setStatusMessage(status.message)
            setState("completed")
            setProgress(100)
          } else {
            setError('Completed but no data received')
            setState("error")
          }
        },
        (errorMessage: string) => {
          // On error
          setError(errorMessage)
          setState("error")
          setProgress(0)
        }
      )
    } catch (error) {
      console.error('Processing error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      setState("error")
    }
  }

  const isProcessing = ["uploading", "processing", "polling", "retrying"].includes(state)

  return {
    state,
    progress,
    statusMessage,
    error,
    bookData,
    currentJobId,
    isProcessing,
    resetState,
    updateProgress,
    updateState,
    processBookImage
  }
}
