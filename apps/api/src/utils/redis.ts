import { generalConfig } from "@repo/lib/src"
import Redis from "ioredis"


const redis = new Redis();

type StatusObject = {
  status: "failed" | "pending"| "completed",
  message:string,
  data?:{
    text:string,
    author?:string,
    title:string,
    category:"fiction"|"non-fiction"
  }
};




export async function setStatus(uuid: string, data: StatusObject) {
    try{
  const jsonString = JSON.stringify(data);
  await redis.hset(generalConfig.CACHENAME, uuid, jsonString);
    }catch(err){
        console.log(err)
    }}

export async function getStatus(jobId:string){
    try {
        const jsonString = await redis.hget(generalConfig.CACHENAME, jobId);
  return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
        console.log(error)
        return null
    }
}