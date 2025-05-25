import axios from 'axios';

const OPENAI_API_KEY = 'your_openai_api_key';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Simulate the agent's function
export async function findBestMatchingBook(queryTitle: {title:string,author?:string}, books: any[]) {
  const prompt = `
You are a helpful assistant that selects the best matching book from a list.
Given a user query with a book title and optional metadata, choose the most relevant book.

User Query:
Title: "${queryTitle.title}"
Author: "${queryTitle.author}"

Book Options:
${books.map((b, i) => `
[${i + 1}]
Title: ${b?.volumeInfo?.title}
Author: ${b?.volumeInfo?.authors?.join(",") ?? 'Unknown'}
Description: ${b?.volumeInfo?.description ?? 'No description'}
Category: ${b?.volumeInfo?.categories?.join(",") ?? 'Uncategorized'}
Link: ${b?.volumeInfo?.previewLink ?? 'No link'}
language: ${b?.volumeInfo?.language?? "no Language"}
`).join('')}

Reply With The relevant book link,author if any , title of the book and determine whether its fiction or non-fiction , it should be prioritized based on  three pointers:
firstly it should be matching title and author if any.This should be given the most cosideration
Secondly if you find multiple books with similar book or if only one check if it has a link if there is no link find the next most relevant book with the link
thirdly if you still get multiple books check if you can find the book in english if yes english should be given the most priority 

Respond ONLY with a valid JSON object that strictly follows the structure above. Do not include any explanation, text, or formatting outside the JSON. 
Output Format:
{
link:"string"
category:"fiction" or "non-fiction"
title: "string",
Author: "string or null"}

Example:
{
link: "https://......",
category: "fiction",
title: "title",
Author: null,
}
`;

  const response = await axios.post(OPENAI_API_URL, {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a book-matching assistant.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  }, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const answer = response.data.choices[0].message.content;
  try {
    console.log(answer)
    if(!answer){
        throw new Error("no contnet found")
    }
  const parsed = JSON.parse(answer);
  return parsed;
} catch (err) {
  console.error("failed to parse content ", answer,"err:",err);
  throw err;
}
}



