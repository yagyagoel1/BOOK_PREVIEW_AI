// filepath: /home/yagyagoel/Documents/book_Determiner/apps/frontend/src/config/api.ts
import axios from 'axios'

// Centralized base URL - change this to your actual API endpoint
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add response interceptor to handle the custom API response format
apiClient.interceptors.response.use(
  (response) => {
    // Always return the response data, the actual status is in response.data.statusCode
    return response
  },
  (error) => {
    // Handle network errors or other axios errors
    if (error.response) {
      // Server responded with error status
      return Promise.resolve(error.response)
    } else if (error.request) {
      // Network error
      return Promise.reject(new Error('Network error: Please check your connection'))
    } else {
      // Other error
      return Promise.reject(error)
    }
  }
)

export default apiClient