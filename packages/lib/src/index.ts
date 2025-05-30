
import dotenv from "dotenv";
dotenv.config();
export const defaultJobOptions = {
    removeOnComplete: {
      count: 100,
      age: 60 * 60 * 24,
    },
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnFail: false,
  }; 
  export const redisConnection = {
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT as string) as number,
  }; 


  export const generalConfig={
    S3REGION:"ap-south-1",
    GPT3:"gpt-4.1-mini",
    GEMINI:"gemini-1.5-flash",
    FICTION:"fiction",
    NON_FICTION:"non-fiction",
    CACHENAME:"status",
    BOOKCACHENAME:"bookCache",
    GPT4:"gpt-4o"
    
}