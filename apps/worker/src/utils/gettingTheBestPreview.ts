import { generalConfig } from '@repo/lib/src';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function findBestMatchingBook(queryTitle: {title:string,author?:string}, books: any[]) {
  const prompt = `
Select the best matching book from the provided list based on the user query.

USER QUERY:
- Title: "${queryTitle.title}"
- Author: "${queryTitle.author || 'Not specified'}"

BOOK OPTIONS:
${books.map((b, i) => `
[${i + 1}] 
Title: ${b?.volumeInfo?.title || 'Unknown'}
Author: ${b?.volumeInfo?.authors?.join(", ") || 'Unknown'}
Description: ${b?.volumeInfo?.description?.substring(0, 200) || 'No description'}...
Categories: ${b?.volumeInfo?.categories?.join(", ") || 'Uncategorized'}
Preview Link: ${b?.volumeInfo?.previewLink || 'No link'}
Language: ${b?.volumeInfo?.language || 'Unknown'}
`).join('')}

SELECTION CRITERIA (in order of priority):
1. EXACT MATCH: Title and author match (highest priority)
2. LINK AVAILABILITY: Must have a valid preview link
3. LANGUAGE: English preferred if multiple options exist
4. CONTENT TYPE: Determine if fiction or non-fiction based on categories/description

Respond with ONLY a valid JSON object:
{
  "previewLink": "string",
  "category": "fiction" or "non-fiction", 
  "title": "string",
  "author": "string or null"
}`;

  const model = genAI.getGenerativeModel({ 
    model: generalConfig.GEMINI,
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      topK: 40,
    }
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const answer = response.text();
  
  try {
    console.log(answer);
    if (!answer) {
      throw new Error("No content found");
    }
    
    // Clean the response to extract JSON
    const cleanedAnswer = answer.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedAnswer);
    return parsed;
  } catch (err) {
    console.error("Failed to parse content:", answer, "err:", err);
    throw err;
  }
}