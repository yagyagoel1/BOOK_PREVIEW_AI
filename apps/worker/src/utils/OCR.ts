
import path from "path"
import {createWorker} from "tesseract.js"



const WORD_SNIPPET_COUNT = 200;

function getFirstWords(text:string, count:number) {
  return text
    .trim()
    .split(/\s+/)
    .slice(0, count)
    .join(' ');
}

async function ocrWithTesseractJS(filePath:string){
  console.log("reaching here")
  console.log(filePath)
  
  try {
    const worker = await createWorker('eng');
    console.log("Worker created successfully")
    
    const { data: { text } } = await worker.recognize(filePath);
    console.log("OCR completed")
    
    await worker.terminate();
    console.log("Worker terminated")
    
    return text.trim();
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
}
export async function doOCR(uuid:string){

  const downloadDir = path.join(__dirname, uuid);
  const fs = require('fs');
  const imageFiles = fs.readdirSync(downloadDir)
    .filter((file:string) => file.endsWith('.jpg'))
    .sort((a: string, b: string) => {
      // Extract the number from the filename (e.g., "uuid_1.jpg" -> 1)
      const getNumber = (filename: string) => {
        const match = filename.match(/_(\d+)\.jpg$/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getNumber(a) - getNumber(b);
    });
  
  const ocrResults = [];
  let i=0;
  for (const imageFile of imageFiles) {
    //ignore first two page according to me they are always going to be starting content 
       i++
    if(i<=2)
    continue 
    const filePath = path.join(downloadDir, imageFile);
    console.log(`Processing OCR for: ${imageFile}`);
    const text = await ocrWithTesseractJS(filePath);
    console.log("ji idhar hu")
    ocrResults.push({
      filename: imageFile,
      text: text,
      snippet: getFirstWords(text, WORD_SNIPPET_COUNT)
    });
  }
  ocrResults.map(ocr=>{
 console.log(ocr.snippet)
 console.log("-----------------")
  })
 
  return ocrResults
}