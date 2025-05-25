export type ProcessingState = "idle" | "uploading" | "processing" | "polling" | "completed" | "error"

export interface BookInfo {
  name: string
  genre: "Fiction" | "Non-Fiction"
}

export interface MockBook {
  name: string
  genre: "Fiction" | "Non-Fiction"
  description: string
}
