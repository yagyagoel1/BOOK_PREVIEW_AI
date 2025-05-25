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
    messages: [
      {
        role: 'system',
        content: `
You are a page classifier. 
I will give you few snippets that are in order of a book i want you to ignore the front matters of the book and get the first or the second (you will get it in input)content page of the book
here is the example input :

    Get me the 1 content page ignoring the front matter  

    PAGES:


    file: '123e4567-e89b-12d3-a456-426614174000_3.jpg',
    snippet: "Contents Cover Title Page Introduction: The Greatest Show On Earth 1. No One’s Crazy 2. Luck & Risk 3. Never Enough 4. Confounding Compounding 5. Getting Wealthy vs. Staying Wealthy 6. Tails, You Win 7. Freedom 8. Man in the Car Paradox 9. Wealth is What You Don’t See 10. Save Money 11. Reasonable > Rational 12. Surprise! 13. Room for Error 14. You'll Change"
    file: '123e4567-e89b-12d3-a456-426614174000_4.jpg',
    snippet: "15. Nothing's Free 16. You & Me 17. The Seduction of Pessimism 18. When You'll Believe Anything 19. All Together Now 20. Confessi Postscript: A Brief History of Why the U.S. Consumer Thinks the Way They Do Endnotes Acknowledgements"
    file: '123e4567-e89b-12d3-a456-426614174000_5.jpg',
    snippet: '“A genius is the man who can do the average thing when everyone else around him is losing his mind.” —Napoleon “The world is full of obvious things which nobody by any chance ever observes.” —Sherlock Holmes'


    here as you can see that each file has a  number against it that is the page number
i want you to get the page that is the first page of the content if the input says "Get me the 1 content page ignoring the front matter" 
else get me the second page of content also when the input says "Get me the 2 content page ignoring the front matter"

Respond ONLY with a valid JSON object that strictly follows the structure above. Do not include any explanation, text, or formatting outside the JSON. 

Example output:
{
file: "uuid_5.jpg"
message:"this is the first page of contnet"
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