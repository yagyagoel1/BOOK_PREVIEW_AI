import { apiClient } from '../config/api'
import { StatusObject } from '../types'
import axios from 'axios'; // Import axios to check for AxiosError

export class BookProcessingService {
  /**
   * Upload book image and get job ID
   */
  static async uploadBookImage(file: File): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      const formData = new FormData()
      formData.append('bookimage', file)

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const apiResponse = response.data

      if (apiResponse.success === 1) {
        return {
          success: true,
          jobId: apiResponse?.jobId,
        }
      } else {
        return {
          success: false,
          error: apiResponse.message || 'Upload failed',
        }
      }
    } catch (error) {
      console.error('Upload error:', error);

      if (axios.isAxiosError(error)) {
        // Axios-specific error handling
        if (error.response) {
          // Server responded with an error status
          if (error.response.status === 413) {
            return {
              success: false,
              error: 'Image size is too huge. Please upload a smaller file.',
            };
          }
          // For other HTTP errors, attempt to use server's message, then Axios's message
          const serverMessage = typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data ? String(error.response.data.message) : undefined;
          return {
            success: false,
            error: serverMessage || error.message || `Request failed with status code ${error.response.status}`,
          };
        } else {
          // Network error or other issue where server didn't respond (e.g., CORS, DNS, client-side network issue)
          // error.message here is typically "Network Error"
          return {
            success: false,
            error: error.message || 'A network error occurred. Please check your connection.',
          };
        }
      } else {
        // Non-Axios error (e.g., error in code before request, or a custom error thrown)
        let errorMessage = 'An unknown error occurred during upload.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        return {
          success: false,
          error: errorMessage,
        };
      }
    }
  }

  /**
   * Poll job status
   */
  static async getJobStatus(jobId: string) {
    let retries = 3
    let delay = 1000 // 1 second

    while (retries > 0) {
      try {
        const response = await apiClient.get(`/statusofjob/${jobId}`)
        const apiResponse = response.data

        if (apiResponse.success === 1) {
          return {
            success: true,
            status: apiResponse.status,
            message: apiResponse.message,
            data: apiResponse.data,
          }
        } else {
          // Don't retry for non-network errors that the server successfully responded with
          return {
            success: false,
            error: apiResponse.message || 'Failed to get job status',
          }
        }
      } catch (error) {
        console.error('Status polling error:', error)
        retries--
        if (retries === 0) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get job status after multiple retries',
          }
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }
    // Should not be reached if retries are exhausted, but as a fallback:
    return {
        success: false,
        error: 'Failed to get job status after multiple retries',
    }
  }

  /**
   * Poll job status with automatic retries until completion
   */
  static async pollJobStatus(
    jobId: string,
    onProgress: (status: StatusObject, progressPercentage: number) => void,
    onComplete: (status: StatusObject) => void,
    onError: (error: string) => void
  ): Promise<void> {
    let progressCounter = 0
    let lastMessage = ''
    const maxProgressSteps = 7 // Expected 6-7 updates for pending status

    const poll = async () => {
      const result = await this.getJobStatus(jobId)

      if (!result.success || !result.status) {
        onError(result.error || 'Failed to get job status')
        return
      }

      const status = result.status
      const statusObject: StatusObject = {
        status,
        message: result.message,
        data: result.data
      }

      switch (status) {
        case 'pending':
          // Only increment progress when message changes
          if (result.message !== lastMessage) {
            progressCounter++
            lastMessage = result.message
          }
          const progressPercentage = Math.floor(Math.min((progressCounter / maxProgressSteps) * 90, 90)) // Max 90% during pending
          onProgress(statusObject, progressPercentage)
          setTimeout(poll, 5000) // Poll every 5 seconds
          break

        case 'retrying':
          progressCounter = 0 // Reset progress on retry
          lastMessage = '' // Reset last message
          onProgress(statusObject, 0)
          setTimeout(poll, 10000) // Poll every 3 seconds for retrying
          break

        case 'completed':
          onProgress(statusObject, 100)
          onComplete(statusObject)
          break

        case 'failed':
          onError(result.message || 'Job failed')
          break

        default:
          onError(`Unknown status: ${status}`)
      }
    }

    poll()
  }
}
