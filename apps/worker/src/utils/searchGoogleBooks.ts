import axios from 'axios';

export async function searchBook(title: string, author?: string) {
  const query = `intitle:${title}${author ? `+inauthor:${author}` : ''}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}`;
  const response = await axios.get(url);
  return response.data.items?.slice(0, 5)||[];
}

 export function getGenreType(categories: string[]): "fiction" | "non-fiction" {
  const nonFictionKeywords = [
    "nonfiction",
    "history",
    "science",
    "biography",
    "memoir",
    "self-help",
    "business",
    "education"
  ];

  const isNonFiction = categories.some(category =>
    nonFictionKeywords.some(keyword =>
      category.toLowerCase().includes(keyword)
    )
  );

  return isNonFiction ? "non-fiction" : "fiction";
}

