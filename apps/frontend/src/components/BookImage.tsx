import React from 'react'

interface BookImageProps {
  imageUrl: string
  title: string
  className?: string
}

export const BookImage: React.FC<BookImageProps> = ({ imageUrl, title, className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-lg shadow-lg ${className}`}>
      <img
        src={imageUrl}
        alt={`Cover of ${title}`}
        className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement
          target.src = '/placeholder-book-cover.png' // Add a placeholder image to your public folder
          target.alt = 'Book cover unavailable'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}

export default BookImage
