// filepath: /home/yagyagoel/Documents/book_Determiner/apps/frontend/src/config/api.ts
import axios from 'axios'

// Centralized base URL - change this to your actual API endpoint
export const BASE_URL = 'https://f0b7-13-232-153-175.ngrok-free.app/api'

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {

    'Content-Type': 'application/json',
    "ngrok-skip-browser-warning": "69420"
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