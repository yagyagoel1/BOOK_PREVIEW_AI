import { Upload, FileImage, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TypewriterText } from "@/components/TypewriterText"
import { FILE_INPUT_ACCEPT, SUPPORTED_FORMATS } from "../constants"
import { useFileValidation, useFileUpload, useBookProcessing } from "../hooks"
import { BookProcessingService } from "../services"

function BookDeterminer() {
  const { isValidImageFile } = useFileValidation()
  const { selectedFile, previewUrl, fileInputRef, handleFileSelect, clearFile } = useFileUpload()
  const { 
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
  } = useBookProcessing()

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && isValidImageFile(file)) {
      handleFileSelect(file)
      resetState()
    } else if (file) {
      alert(`Please select an image file only. Selected file: ${file.name} (Type: ${file.type})`)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && isValidImageFile(file)) {
      handleFileSelect(file)
      resetState()
    } else if (file) {
      alert(`Please drop an image file only. Dropped file: ${file.name} (Type: ${file.type})`)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const uploadAndAnalyze = async () => {
    if (!selectedFile) return

    try {
      updateState("uploading")
      updateProgress(10)

      await BookProcessingService.simulateUpload()
      updateProgress(30)

      updateState("processing")
      await BookProcessingService.simulateProcessing()
      updateProgress(60)

      updateState("polling")
      await BookProcessingService.simulatePolling()
      updateProgress(90)

      await BookProcessingService.simulateResponse()
      updateProgress(100)

      const result = await BookProcessingService.processBook()
      
      if (result.success && result.bookInfo && result.description) {
        setBookResult(result.bookInfo, result.description)
      } else if (result.error) {
        setErrorResult(result.error)
      }
    } catch (err) {
      setErrorResult("An unexpected error occurred while processing your request. Please try again.")
    }
  }

  const resetApp = () => {
    clearFile()
    resetState()
  }

  const getStateMessage = () => {
    switch (state) {
      case "uploading":
        return "Uploading book image..."
      case "processing":
        return "Processing book data..."
      case "polling":
        return "Identifying book..."
      case "completed":
        return "Book identified successfully!"
      case "error":
        return "Book identification failed"
      default:
        return ""
    }
  }

  const getStateIcon = () => {
    switch (state) {
      case "uploading":
      case "processing":
      case "polling":
        return <Loader2 className="h-5 w-5 animate-spin" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Book Determiner
          </h1>
          <p className="text-gray-400 text-lg">
            Upload a book image and get AI-powered book identification and preview
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={FILE_INPUT_ACCEPT}
              onChange={handleFileInputChange}
              className="hidden"
              title="Select an image file"
            />
            
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-md max-h-64 mx-auto rounded-lg border border-gray-700"
                />
                <p className="text-gray-400">
                  {selectedFile?.name} ({(selectedFile?.size! / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <FileImage className="h-16 w-16 mx-auto text-gray-500" />
                <div>
                  <p className="text-xl font-medium">Drop your book image here</p>
                  <p className="text-gray-400 mt-2">or click to browse image files</p>
                  <p className="text-gray-500 text-sm mt-1">Supported formats: {SUPPORTED_FORMATS}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Button
            onClick={uploadAndAnalyze}
            disabled={!selectedFile || isProcessing}
            className="bg-white text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Identify Book
              </>
            )}
          </Button>
          
          {(selectedFile || state !== "idle") && (
            <Button
              onClick={resetApp}
              variant="outline"
              disabled={isProcessing}
            >
              Reset
            </Button>
          )}
        </div>

        {/* Progress Section */}
        {(isProcessing || state === "completed" || state === "error") && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              {getStateIcon()}
              <span className="font-medium">{getStateMessage()}</span>
            </div>
            
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-400 text-center">
                  {progress}% complete
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {state === "completed" && response && bookInfo && (
          <div className="space-y-6">
            {/* Book Identification */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Book Identified
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-medium">Title:</span>
                  <span className="text-white font-semibold text-lg">{bookInfo.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-medium">Genre:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bookInfo.genre === 'Fiction' 
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                      : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                  }`}>
                    {bookInfo.genre}
                  </span>
                </div>
              </div>
            </div>

            {/* Book Preview */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6" >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Preview of the book: {bookInfo.name}
              </h3>
              <div className="bg-black/50 rounded-lg p-6 border border-gray-700 min-h-[60vh] max-h-[70vh] overflow-y-auto">
                <TypewriterText
                  text={response}
                  speed={30}
                  className="text-gray-300 leading-relaxed text-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Section */}
        {state === "error" && error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              Error
            </h3>
            <div className="bg-black/50 rounded-lg p-4 border border-red-700">
              <TypewriterText
                text={error}
                speed={40}
                className="text-red-300 leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookDeterminer
