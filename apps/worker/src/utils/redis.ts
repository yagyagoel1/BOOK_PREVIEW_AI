import { generalConfig } from "@repo/lib/src"
import Redis from "ioredis"
import type {StatusObject} from "@repo/lib/src/types"

const redis = new Redis();






export async function setStatus(uuid: string, data: StatusObject) {
    try{
  const jsonString = JSON.stringify(data);
  await redis.hset(generalConfig.CACHENAME, uuid, jsonString);
    }catch(err){
        console.log(err)
    }}
