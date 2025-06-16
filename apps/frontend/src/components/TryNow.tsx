import React from 'react';

interface TryNowProps {
  onBookSelect: (imageSrc: string, fileName: string) => void;
}

const TryNow: React.FC<TryNowProps> = ({ onBookSelect }) => {
  const books = [
    { name: 'Atomic Habits', imgSrc: '/atomic_habits.jpg', fileName: 'atomic_habits.jpg' },
    { name: 'Ikigai', imgSrc: '/ikigai.webp', fileName: 'ikigai.webp' },
    { name: 'Psychology of Money', imgSrc: '/ThePsychologyofMoney.webp', fileName: 'ThePsychologyofMoney.webp' },
  ];

  const handleBookClick = (imgSrc: string, fileName: string) => {
    onBookSelect(imgSrc, fileName);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Or, try with a sample:</h2>
      <div className="flex justify-center items-start space-x-4">
        {books.map((book) => (
          <div 
            key={book.name} 
            className="text-center cursor-pointer group"
            onClick={() => handleBookClick(book.imgSrc, book.fileName)}
          >
            <img
              src={book.imgSrc}
              alt={book.name}
              className="w-28 h-40 md:w-32 md:h-48 object-cover mx-auto mb-2 rounded-md border-2 border-gray-700 group-hover:border-blue-500 transition-all duration-200 transform group-hover:scale-105"
            />
            <p className="text-sm md:text-base font-medium text-gray-300 group-hover:text-white transition-colors duration-200">{book.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TryNow;
