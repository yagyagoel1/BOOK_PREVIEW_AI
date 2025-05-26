export type ProcessingState = "idle" | "uploading" | "processing" | "polling" | "completed" | "error" | "retrying"

export interface BookInfo {
  name: string
  genre: "Fiction" | "Non-Fiction"
}

export interface MockBook {
  name: string
  genre: "Fiction" | "Non-Fiction"
  description: string
}

export type StatusObject = {
  status: "failed" | "pending" | "completed" | "retrying"
  message: string
  data?: {
    text: string
    author?: string
    title: string
    category: "fiction" | "non-fiction"
    imageUrl?: string
  }
}

export interface ApiResponse<T = any> {
  success: 0 | 1
  statusCode: number
  message: string
  errors?: Error | null
  timestamp: string
  data?: T
}

export interface UploadResponse {
  jobId: string
}

export interface JobStatusResponse {
  jobId: string
  status: StatusObject
}
