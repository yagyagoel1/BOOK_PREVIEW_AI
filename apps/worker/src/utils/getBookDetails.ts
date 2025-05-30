import { config } from "dotenv";

import { OpenAI } from "openai";
import { generalConfig } from "@repo/lib/src";
import fs from 'fs';
import path from 'path';
import axios from 'axios';

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getImageAsBase64(filePathOrUrl: string): Promise<string> {
  if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
    const response = await axios.get(filePathOrUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  } else {
    const imageBuffer = fs.readFileSync(filePathOrUrl);
    return imageBuffer.toString('base64');
  }
}

export async function analyzeBookCover(imagePathOrUrl: string) {
  const base64Image = await getImageAsBase64(imagePathOrUrl);
  const response = await openai.chat.completions.create({
    model: generalConfig.GPT4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You're a book cover recognition assistant. Analyze the image and answer:
- Is this a book cover?
- Is the image blurry enough that you are not able to read?
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
              "url": `data:image/jpeg;base64,${base64Image}`
            }
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0].message.content;

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



