import { MOCK_BOOKS, MOCK_ERRORS } from '../constants'
import { BookInfo } from '../types'

export class BookProcessingService {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static async simulateUpload(): Promise<void> {
    await this.delay(1000)
  }

  static async simulateProcessing(): Promise<void> {
    await this.delay(1500)
  }

  static async simulatePolling(): Promise<void> {
    await this.delay(2000)
  }

  static async simulateResponse(): Promise<void> {
    await this.delay(1000)
  }

  static async processBook(): Promise<{ success: boolean; bookInfo?: BookInfo; description?: string; error?: string }> {
    // 90% success rate
    if (Math.random() > 0.1) {
      const randomBook = MOCK_BOOKS[Math.floor(Math.random() * MOCK_BOOKS.length)]
      return {
        success: true,
        bookInfo: { name: randomBook.name, genre: randomBook.genre },
        description: randomBook.description
      }
    } else {
      const randomError = MOCK_ERRORS[Math.floor(Math.random() * MOCK_ERRORS.length)]
      return {
        success: false,
        error: randomError
      }
    }
  }
}
