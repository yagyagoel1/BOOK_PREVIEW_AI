# 📚 Book Determiner

An AI-powered web application that identifies books from cover images and provides intelligent previews of their content using advanced OCR, machine learning, and natural language processing.

## ✨ Features

### 🔍 **Intelligent Book Recognition**
- Upload book cover images and get instant AI-powered identification
- Advanced blur detection and image quality validation
- Support for multiple image formats (JPEG, PNG, WebP)

### 📖 **Smart Content Preview**
- Automatically fetches book previews from Google Books
- OCR processing to extract readable text from book pages
- AI-powered content filtering to identify main content pages
- Eliminates front matter (covers, table of contents, etc.)

### 🎯 **Genre Classification**
- Automatic fiction vs non-fiction categorization
- Book metadata extraction (title, author, category)
- Integration with Google Books API for comprehensive book data

### 💻 **Modern User Experience**
- Real-time progress tracking with meaningful status updates
- Typewriter-style text animation for results display
- Drag-and-drop file upload interface
- Responsive design with dark theme

## 🏗️ Architecture

This project uses a **microservices architecture** built with:

```
├── 🌐 Frontend (React + Vite + TypeScript)
├── 🔧 API Server (Express + TypeScript)
├── ⚙️  Background Worker (Bull MQ + AI Services)
└── 📦 Shared Packages (TypeScript configs, utilities, logger)
```

### **Core Components:**

- **Frontend**: Modern React application with TypeScript, Tailwind CSS, and Vite
- **API Server**: RESTful API handling file uploads and job status management
- **Worker Service**: Background processing with OCR, AI analysis, and book matching
- **Queue System**: Redis-based job queue for reliable background processing
- **Storage**: AWS S3 for image storage and processing

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.15.6
- **Redis** server running
- **AWS S3** bucket configured
- **API Keys**:
  - OpenAI API key
  - Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book_Determiner
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   
   Create `.env` files in each app directory:

   **apps/api/.env**
   ```env
   PORT=3000
   REDIS_URL=redis://localhost:6379
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_BUCKET_NAME=your_s3_bucket_name
   AWS_REGION=your_aws_region
   ```

   **apps/worker/.env**
   ```env
   REDIS_URL=redis://localhost:6379
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_BUCKET_NAME=your_s3_bucket_name
   AWS_REGION=your_aws_region
   ```

4. **Start Redis server**
   ```bash
   redis-server
   ```

5. **Build the project**
   ```bash
   pnpm build
   ```

6. **Start development servers**
   ```bash
   pnpm dev
   ```

   This will start:
   - Frontend: `http://localhost:3001`
   - API Server: `http://localhost:3000`
   - Worker: Background processing service

## 🔄 How It Works

### 1. **Image Upload & Validation**
```typescript
// User uploads book cover image
const uploadResult = await BookProcessingService.uploadBookImage(file)
```

### 2. **AI-Powered Cover Analysis**
- **Blur Detection**: Ensures image quality is sufficient for processing
- **Cover Validation**: Confirms the image is actually a book cover
- **Metadata Extraction**: Uses OpenAI GPT-4 Vision to extract title, author, and genre

### 3. **Book Matching & Preview Fetching**
- **Google Books Search**: Finds matching books using extracted metadata
- **Best Match Selection**: AI-powered selection of the most accurate book match
- **Preview Download**: Fetches book preview pages using Puppeteer

### 4. **Content Processing**
- **OCR Processing**: Tesseract.js extracts text from book pages
- **Content Filtering**: AI identifies main content pages, skipping front matter
- **Text Extraction**: Returns clean, readable text from the actual book content

### 5. **Results Display**
- **Real-time Updates**: Progress tracking with meaningful status messages
- **Typewriter Animation**: Elegant display of extracted text
- **Book Information**: Title, author, genre, and preview image

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Lucide React** icons
- **Axios** for API communication

### **Backend Services**
- **Express.js** with TypeScript
- **Multer** for file upload handling
- **Bull MQ** for job queue management
- **Redis** for caching and queue storage

### **AI & Processing**
- **OpenAI GPT-4 Vision** for book cover analysis
- **Google Gemini** for content matching
- **Tesseract.js** for OCR processing
- **Puppeteer** for web scraping

### **Infrastructure**
- **AWS S3** for file storage
- **Turborepo** for monorepo management
- **TypeScript** throughout the stack
- **ESBuild/TSup** for fast builds

## 📁 Project Structure

```
book_Determiner/
├── apps/
│   ├── frontend/          # React web application
│   │   ├── src/
│   │   │   ├── components/    # UI components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── pages/         # Application pages
│   │   │   ├── services/      # API communication
│   │   │   └── types/         # TypeScript definitions
│   │   └── package.json
│   ├── api/               # Express API server
│   │   ├── src/
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── middlewares/   # Express middlewares
│   │   │   ├── router/        # API routes
│   │   │   └── services/      # Business logic
│   │   └── package.json
│   └── worker/            # Background job processor
│       ├── src/
│       │   └── utils/         # Processing utilities
│       └── package.json
├── packages/
│   ├── config-typescript/     # Shared TypeScript configs
│   ├── lib/                   # Shared utilities
│   └── logger/                # Logging utilities
├── turbo.json                 # Turborepo configuration
└── package.json               # Root package configuration
```

## 🚦 API Endpoints

### **POST** `/upload`
Upload a book cover image for processing.

**Request:**
- `Content-Type: multipart/form-data`
- `bookimage`: Image file (JPEG, PNG, WebP)

**Response:**
```json
{
  "success": 1,
  "jobId": "unique-job-id",
  "message": "Upload successful"
}
```

### **GET** `/statusofjob/:jobId`
Get the current status of a processing job.

**Response:**
```json
{
  "success": 1,
  "status": "completed",
  "message": "Processing completed successfully",
  "data": {
    "title": "Book Title",
    "author": "Author Name",
    "category": "fiction",
    "text": "Extracted book content...",
    "imageUrl": "https://s3-url-to-page-image"
  }
}
```

## 🔧 Development

### **Running Tests**
```bash
pnpm test
```

### **Type Checking**
```bash
pnpm check-types
```

### **Linting**
```bash
pnpm lint
```

### **Formatting**
```bash
pnpm format
```

### **Building for Production**
```bash
pnpm build
```

## 🎯 Use Cases

- **Book Discovery**: Identify unknown books from photos
- **Library Management**: Quickly catalog physical books
- **Reading Research**: Get previews before purchasing
- **Educational Tools**: Analyze book content for academic purposes
- **Accessibility**: Convert physical books to digital text

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 Vision API
- **Google** for Books API and Gemini AI
- **Tesseract.js** community for OCR capabilities
- **React** and **Node.js** ecosystems

---

**Built with ❤️ by Yagya**