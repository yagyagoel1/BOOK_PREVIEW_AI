import { generalConfig } from "@repo/lib/src";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export function snippetBuilder(arraySnippet:Array<{
  filename:string,
  snippet:string,
  text:string
}>,pageNo=1){
    const formattedSnippets = arraySnippet.map(item => 
    `file: '${item.filename}',\n    snippet: "${item.snippet}"`
  ).join('\n    ');
  
  return `
  Get me the ${pageNo} content page ignoring the front matter 
  
  PAGES:
  ${formattedSnippets}
  `
}
export async function isMainContent(snippet: string){
  const resp = await openai.chat.completions.create({
    model: generalConfig.GPT3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: 'system',
        content: `
You are a page classifier for digitized books. You will be given a set of book pages in order with their image file names and text snippets. Your task is to ignore all front matter (such as the cover, title page, table of contents, dedication,prologue, quotes, introduction, etc.) and return either the first or second actual content page (based on the instruction).

Instructions:

The front matter includes: cover, title page, copyright, dedication, quotes, table of contents, and introductions.
Actual content pages begin with chapter titles, numbered sections, or main body content.
You will receive a request like:"Get me the 1 content page ignoring the front matter"or"Get me the 2 content page ignoring the front matter"
Based on that, return the first or second valid content page.

Input Format:

You will receive:
An instruction (e.g., "Get me the 1 content page ignoring the front matter")
A list of PAGES with:
file: image file name
snippet: text from that page

Output Format:

Respond ONLY with a JSON object in the following structure:
{
  "file": "filename_here.jpg",
  "pageno": "this is first page because 1 was passed"
}

Example Input:
Get me the 1 content page ignoring the front matter

PAGES:

file: '123e4567-e89b-12d3-a456-426614174000_3.jpg',
snippet: "Contents Cover Title Page Introduction: The Greatest Show On Earth 1. No One’s Crazy 2. Luck & Risk 3. Never Enough 4. Confounding Compounding 5. Getting Wealthy vs. Staying Wealthy 6. Tails, You Win 7. Freedom 8. Man in the Car Paradox 9. Wealth is What You Don’t See 10. Save Money 11. Reasonable > Rational 12. Surprise! 13. Room for Error 14. You'll Change"

file: '123e4567-e89b-12d3-a456-426614174000_4.jpg',
snippet: "15. Nothing's Free 16. You & Me 17. The Seduction of Pessimism 18. When You'll Believe Anything 19. All Together Now 20. Confessi Postscript: A Brief History of Why the U.S. Consumer Thinks the Way They Do Endnotes Acknowledgements"

file: '123e4567-e89b-12d3-a456-426614174000_5.jpg',
snippet: '“A genius is the man who can do the average thing when everyone else around him is losing his mind.” —Napoleon “The world is full of obvious things which nobody by any chance ever observes.” —Sherlock Holmes'

Example Output:

{
  "file": "123e4567-e89b-12d3-a456-426614174000_5.jpg",
  "pageno": "this is first page because 1 was passed"
}
    `
      },
      { role: 'user', content: snippet }
    ],
    temperature: 0
  });

  const content = resp.choices[0].message.content;
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
}