
import path from "path"
import {createWorker} from "tesseract.js"



const WORD_SNIPPET_COUNT = 100;

function getFirstWords(text:string, count:number) {
  return text
    .trim()
    .split(/\s+/)
    .slice(0, count)
    .join(' ');
}

async function ocrWithTesseractJS(filePath:string){
  const worker = await createWorker();

  const {
    data: { text }
  } = await worker.recognize(filePath);

  await worker.terminate();
  return text.trim();
}
export async function doOCR(uuid:string){

  const downloadDir = path.join(__dirname, uuid);
  const fs = require('fs');
  const imageFiles = fs.readdirSync(downloadDir).filter((file:string) => file.endsWith('.jpg'));
  
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
    ocrResults.push({
      filename: imageFile,
      text: text,
      snippet: getFirstWords(text, WORD_SNIPPET_COUNT)
    });
  }
  return ocrResults
}