import dotenv from 'dotenv';
import {Queue,Job} from  "bullmq"
import { redisConnection,defaultJobOptions } from "@repo/lib/src"
dotenv.config()
const myQueue = new Queue(process.env.QUEUE_NAME as string, {
    connection: redisConnection,
    defaultJobOptions: defaultJobOptions,
  });


export async function addJobs(path:String,id:string):Promise<null| String> {

  try {
    await myQueue.add(process.env.JOB_NAME as string, { path, id }, { jobId: id });
    return id
  }
  catch (error) {
    console.log(error)
    return null
  }
}

export async function getJobStatus(jobId:string):Promise<null|string> {
  const job = await Job.fromId(myQueue, jobId);
  
  if (!job) {
      console.log(`Job with ID ${jobId} not found.`);
      return null;
  }


  const state = await job.getState();
  console.log(`Job ${jobId} is in state: ${state}`);

  return state;
}