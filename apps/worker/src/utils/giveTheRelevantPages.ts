


import { createWorker } from 'tesseract.js';
import { OpenAI } from 'openai';

// ———– CONFIG ———–
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = 'gpt-4';  // or 'gpt-3.5-turbo'
const WORD_SNIPPET_COUNT = 100;

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function ocrPage(url: string): Promise<string> {
  const response = await fetch(url); 
  const arrayBuffer = await response.arrayBuffer();
  const worker = await createWorker();
  
  const { data: { text } } = await worker.recognize(Buffer.from(arrayBuffer));
  await worker.terminate();
  return text;
}


function getFirstWords(text: string, count: number): string {
  return text
    .trim()
    .split(/\s+/)
    .slice(0, count)
    .join(' ');
}


async function isMainContent(snippet: string): Promise<boolean> {
  const resp = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `
You are a page classifier. 
Given a short snippet (first ~100 words) from a book scan, respond with exactly one word:
- "Content"      if this is part of the book's main narrative or body text
- "FrontMatter"  if this is cover, preface, table of contents, acknowledgements, etc.
`.trim()
      },
      { role: 'user', content: snippet }
    ],
    temperature: 0
  });

  const label = resp.choices[0].message.content?.trim();
  return label.toLowerCase() === 'content';
}

/**
 * Loop through URLs, OCR + classify, collect first two content pages
 */
async function extractFirstTwoContentPages(urls: string[]): Promise<string[]> {
  const contentPages: string[] = [];
    let snippets = []
  for (const url of urls) {
    const fullText = await ocrPage(url);
    const snippet = getFirstWords(fullText, WORD_SNIPPET_COUNT);

    snippets.push({
        snippet,
        url
    })
  }
const content  = await isMainContent(snippets)
try {
    console.log(content)
    if(!content){
        throw new Error("no contnet found")
    }
  const parsed = JSON.parse(content);
  return parsed;
} catch (err) {
  console.error("failed to parse content ", content,"err:",err);
  throw err;
}

  return contentPages;
}

