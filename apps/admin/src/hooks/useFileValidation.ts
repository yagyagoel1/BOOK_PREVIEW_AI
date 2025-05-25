import { VALID_IMAGE_MIME_TYPES, VALID_IMAGE_EXTENSIONS } from '../constants'

export const useFileValidation = () => {
  const isValidImageFile = (file: File): boolean => {
    // Check file extension as fallback
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    return file.type.startsWith('image/') || 
           VALID_IMAGE_MIME_TYPES.includes(file.type) || 
           VALID_IMAGE_EXTENSIONS.includes(fileExtension)
  }

  return { isValidImageFile }
}
