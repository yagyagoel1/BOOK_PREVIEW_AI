


//get the image url 

//check the blurr

//push it to    import  { exec,spawn } from 'child_process'
import  fs from 'fs';
import { Worker, Job } from "bullmq";
import  { redisConnection } from '@repo/lib/src';
import dotenv from 'dotenv';
import axios from 'axios';
import { getPresignedUrl } from './utils/getS3Url';
import { analyzeBookCover } from './utils/getBookDetails';
import { isNonFiction, searchBook } from './utils/searchGoogleBooks';
dotenv.config()


const processTask = async(startTime:number,data:{id:string,path:string})=>{
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

  const bookData  = await searchBook(aboutBook?.title,aboutBook?.author?aboutBook.author:null)
if (bookData) {
  const previewLink = bookData.volumeInfo.previewLink;
  console.log("Preview URL:", previewLink);
}
const categories = bookData.volumeInfo.categories || [];
const nonFiction = isNonFiction(categories);
console.log("Categories:", categories);
console.log("Is Non-Fiction:", nonFiction);

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
        await processTask(startTime,data);

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