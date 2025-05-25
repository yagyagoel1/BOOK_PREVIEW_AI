import { MockBook } from '../types'

export const VALID_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
]

export const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export const FILE_INPUT_ACCEPT = 'image/*,.jpg,.jpeg,.png,.webp'

export const SUPPORTED_FORMATS = 'JPG, JPEG, PNG, WebP'

export const MOCK_BOOKS: MockBook[] = [
  {
    name: "The Art of Computer Programming",
    genre: "Non-Fiction",
    description: "This appears to be a comprehensive technical document about computer programming and algorithms. The book contains detailed explanations of data structures, sorting algorithms, and mathematical analysis of computational complexity. Key topics include fundamental programming concepts, algorithm design patterns, and mathematical foundations of computer science. The content is highly technical with code examples, mathematical proofs, and extensive references to computer science literature."
  },
  {
    name: "To Kill a Mockingbird",
    genre: "Fiction",
    description: "This is a classic American novel that explores themes of racial injustice, moral growth, and childhood innocence in the American South. The story follows Scout Finch as she observes her father defend a Black man falsely accused of rape. The narrative deals with complex social issues through the eyes of a child, examining prejudice, empathy, and the loss of innocence. The book is renowned for its powerful portrayal of moral courage and social commentary."
  },
  {
    name: "Sapiens: A Brief History of Humankind",
    genre: "Non-Fiction",
    description: "This is a thought-provoking examination of human history and civilization. The book traces the journey of Homo sapiens from ancient hunter-gatherers to modern global societies. It explores major revolutions in human development including the Cognitive Revolution, Agricultural Revolution, and Scientific Revolution. The author presents complex anthropological and historical concepts in an accessible way, examining how humans became the dominant species on Earth."
  },
  {
    name: "1984",
    genre: "Fiction",
    description: "This is a dystopian political fiction novel that presents a chilling vision of a totalitarian future society. The story follows Winston Smith living under the oppressive rule of Big Brother in Oceania. The book explores themes of surveillance, propaganda, thought control, and the manipulation of truth. It introduces concepts like doublethink, thoughtcrime, and newspeak that have become part of political discourse about authoritarianism and government overreach."
  },
  {
    name: "The Lean Startup",
    genre: "Non-Fiction",
    description: "This is a business methodology book that revolutionizes how companies are built and new products are launched. The book introduces the Build-Measure-Learn feedback loop and emphasizes the importance of validated learning and iterative product development. It provides practical guidance for entrepreneurs on how to reduce waste, increase chances of success, and build sustainable businesses through continuous innovation and customer feedback."
  }
]

export const MOCK_ERRORS = [
  "Failed to process the image. The document appears to be corrupted or the text is not clearly visible. Please try uploading a higher quality image with better lighting and contrast.",
  "The uploaded file format is not supported or the image quality is too poor for text recognition. Please ensure the image is clear, well-lit, and in a supported format (JPEG, PNG, etc.).",
  "Processing timeout occurred. The document may be too complex or large to process efficiently. Try uploading a smaller section of the document or ensure the image is optimized for text recognition.",
  "Unable to detect readable text in the uploaded image. Please ensure the document contains clear, legible text and is properly oriented before uploading."
]
