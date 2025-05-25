


//get the image url 

//check the blurr

//push it to    import  { exec,spawn } from 'child_process'
import { Worker, Job } from "bullmq";
import  { generalConfig, redisConnection } from '@repo/lib/src';
import dotenv from 'dotenv';
import { getPresignedUrl } from './utils/getS3Url';
import { analyzeBookCover } from './utils/getBookDetails';
import { getGenreType, searchBook } from './utils/searchGoogleBooks';
import { downloadPreviewPages } from './utils/getPagesFromPreview';
import { findBestMatchingBook } from './utils/gettingTheBestPreview';
import { doOCR } from './utils/OCR';
import { isMainContent, snippetBuilder } from './utils/giveTheRelevantPages';
dotenv.config()


const processTask = async(jobId:string,startTime:number,data:{id:string,path:string})=>{
  const presignedUrl = await getPresignedUrl(data.path)
  try{
  const aboutTheBook = await analyzeBookCover(presignedUrl)
    const aboutBook = aboutTheBook?.details
  if(!aboutTheBook?.isCover){
    //push to redis  and enjoy i guess set the status failed to its not a cover 
  }
  if(aboutTheBook?.isBlurry){
     //push to redis  and enjoy i guess set the status to failed  its blurry
  }
  if(!aboutBook?.title){
     //use fallback for image search 
  }

  const booksData  = await searchBook(aboutBook?.title,aboutBook?.author?aboutBook.author:null)
if(!booksData.length){

}
let responseFromModel
try{
 responseFromModel = await findBestMatchingBook(aboutBook,booksData)
if(!responseFromModel.previewLink){
    throw new Error("previewLink Not Found")
}
//fallback
}catch(error){
    console.log(error)
    responseFromModel={
        previewLink: booksData?.[0]?.volumeInfo?.previewLink,
        author:booksData?.[0]?.volumeInfo?.authors?.join(","),
        title: booksData?.[0]?.volumeInfo?.title,
        category:getGenreType(booksData?.[0]?.volumeInfo?.categories)
    }
}
await downloadPreviewPages(responseFromModel?.previewLink,jobId)
const ocrResults = await doOCR(jobId)
const snippetToPassToAI =  snippetBuilder(ocrResults,responseFromModel.category.toLowerCase()==generalConfig.FICTION?1:2)
const resultImage = await isMainContent(snippetToPassToAI)
let contentPage
if(resultImage&&resultImage.file){
  contentPage = ocrResults.filter(res=>{
    return resultImage.file==res.filename
  })[0]
  const actualTextContent  = contentPage.text

  // push to redis with the 
}


  }catch(err){
    console.log(err)
    //handle erro case
  }
}
const  handler  = new Worker(
    process.env.QUEUE_NAME as string,
    async (job: Job)=>{
          const data = job.data
        const startTime = performance.now();
        await processTask(job.id||"can we generrate random uuid here ",startTime,data);

    },{
        connection:redisConnection,
        removeOnComplete: {
            age: 3600, 

            count: 500, 
          },
          removeOnFail: {
            age: 24 * 3600, 
          }
    }
)
handler.on("completed", (job:Job) => {
    console.log(`Job with id ${job.id} has been completed`);
  });
  handler.on("failed", (job, error:Error) => {
    console.log(error)
    console.log(`Job with id ${job?.id} has failed with error ${error.message}`);
  });   