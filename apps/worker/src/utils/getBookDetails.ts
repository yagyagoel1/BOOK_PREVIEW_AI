import { config } from "dotenv";

import { OpenAI } from "openai";
import { generalConfig } from "@repo/lib/src";

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeBookCover(presignedUrl: string) {

  const response = await openai.chat.completions.create({
    model: generalConfig.MODELNAME,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You're a book cover recognition assistant. Analyze the image and answer:
- Is this a book cover?
- Is the image blurry?
- What is the title and author of the book (if visible)?
- Is the book fiction or non-fiction? 
Strictly follow the structure(which is json) given below for the output and do not send output in any other way
Structure:
{
isCover:("yes" or "no"),
isBlurry:("yes" or "no"),
details:{
title:output
author:output
},
type:("fiction" or "non-fiction")
 }


 IMPORTANT NOTES:
 FIRST TWO QUESTION SHOULD BE ANSWERED IN YES OR NO 
 THIRD QUESTION SHOULD ONLY BE ANSWERED IF YOU ARE CONFIDENT OF THE AUTHOR AND/OR TITLE OF THE BOOK ELSE IT SHOULD BE KEPT AS NULL
 FOURTH QUESTION SHOULD ONLY BE ANSWERED IF YOU ARE CONFIDENT AND SHOULD BE IN "fiction" or  "non-fiction" IF YOU ARE NOT SURE KEEP IT AS NULL

Example output:
{
isCover:"YES",
isBlurry:"NO",
details:{
title:"atomic habits"
author:"James Clear"
},
type:"non-fiction"
 }
Example two:
{
isCover:"NO",
isBlurry:"NO",
details:{
title:null
author:null
},
type:null
 }

Respond ONLY with a valid JSON object that strictly follows the structure above. Do not include any explanation, text, or formatting outside the JSON. `,
          },
          {
            type: "image_url",
            image_url: {
              url:presignedUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0].message.content;

try {
    console.log(content)
  const parsed = JSON.parse(content);
  return parsed;
} catch (err) {
  console.error("failed to parse content ", content,"err:",err);
  throw err;
}
}



