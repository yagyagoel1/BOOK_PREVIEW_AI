import { generalConfig } from '@repo/lib/src';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
previewLink:"string"
category:"fiction" or "non-fiction"
title: "string",
author: "string or null"}

Example:
{
previewLink: "https://......",
category: "fiction",
title: "title",
author: null,
}
`;

  const response = await openai.chat.completions.create({
    model: generalConfig.GPT3,
    response_format: { type: "json_object" },
    messages: [
      { role: 'system', content: 'You are a book-matching assistant.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });

  const answer = response.choices[0].message.content;
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