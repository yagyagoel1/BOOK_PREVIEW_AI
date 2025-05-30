import { generalConfig } from "@repo/lib/src"
import Redis from "ioredis"
import type {StatusObject} from "@repo/lib/src/types"

const redis = new Redis();


export interface CacheData{text:string,author?:string,imageUrl?:string,category:"fiction"|"non-fiction"}

export interface CheckpointData {
  step: string;
  data: any;
  timestamp: number;
}

export async function setCheckpoint(jobId: string, step: string, data: any) {
  try {
    const checkpointData: CheckpointData = {
      step,
      data,
      timestamp: Date.now()
    };
    await redis.hset(`${generalConfig.CACHENAME}:checkpoints`, jobId, JSON.stringify(checkpointData));
  } catch (err) {
    console.log('Error setting checkpoint:', err);
  }
}

export async function getCheckpoint(jobId: string): Promise<CheckpointData | null> {
  try {
    const checkpointJSON = await redis.hget(`${generalConfig.CACHENAME}:checkpoints`, jobId);
    return checkpointJSON ? JSON.parse(checkpointJSON) : null;
  } catch (err) {
    console.log('Error getting checkpoint:', err);
    return null;
  }
}

export async function clearCheckpoint(jobId: string) {
  try {
    await redis.hdel(`${generalConfig.CACHENAME}:checkpoints`, jobId);
  } catch (err) {
    console.log('Error clearing checkpoint:', err);
  }
}

export async function cleanupStaleCheckpoints(maxAgeHours: number = 24) {
  try {
    const checkpoints = await redis.hgetall(`${generalConfig.CACHENAME}:checkpoints`);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    
    for (const [jobId, checkpointJSON] of Object.entries(checkpoints)) {
      try {
        const checkpoint: CheckpointData = JSON.parse(checkpointJSON);
        if (now - checkpoint.timestamp > maxAge) {
          await redis.hdel(`${generalConfig.CACHENAME}:checkpoints`, jobId);
          console.log(`Cleaned up stale checkpoint for job: ${jobId}`);
        }
      } catch (parseError) {
        await redis.hdel(`${generalConfig.CACHENAME}:checkpoints`, jobId);
        console.log(`Cleaned up corrupted checkpoint for job: ${jobId}`);
      }
    }
  } catch (err) {
    console.log('Error cleaning up stale checkpoints:', err);
  }
}

export async function setStatus(uuid: string, data: StatusObject) {
    try{
  const jsonString = JSON.stringify(data);
  await redis.hset(generalConfig.CACHENAME, uuid, jsonString);
    }catch(err){
        console.log(err)
    }}

export async function pushToCache(title:string,data:CacheData){
  try{
   const oldBooksJSON = await redis.hget(generalConfig.BOOKCACHENAME, title);
   const newBooks = oldBooksJSON ? JSON.parse(oldBooksJSON) : [];
   newBooks.push(data);
   await redis.hset(generalConfig.BOOKCACHENAME, title, JSON.stringify(newBooks));
   console.log(title)
   console.log(newBooks)
  }catch(error){
    console.log(error)
  }
}
export async function getFromBookCache(title:string):Promise<Array<CacheData>|null>{
const books =await redis.hget(generalConfig.BOOKCACHENAME, title);
if(books){
  const parsedBooks = JSON.parse(books)
  return parsedBooks
}else{
  return null
}
}