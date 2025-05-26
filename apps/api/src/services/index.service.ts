import { addJobs } from "../utils/Queue"
import { getStatus, setStatus } from "../utils/redis"
import Resp from "../utils/Resp"
import { uploadToS3 } from "../utils/uploadToS3"


export const handleUploadService  = async(bookImagePath:string)=>{
const bookPath = await uploadToS3(bookImagePath)
if(!bookPath){
  return  Resp.error("upload to s3 failed",400)
    
}
const uuid = bookPath?.split("/")[1]?.split(".")[0]
const jobId = await addJobs(bookPath, uuid)
await setStatus(jobId as string,{status:"pending",message:"validating your image"})
if(!jobId){
  return  Resp.error("failed to push to queue",400)
    
}

return Resp.success({jobId},"Upload Was Successful Processing the Image")
 

}

export const getStatusOfAJobService = async(jobId:string)=>{
  const status = await getStatus(jobId)
  if(!status){
    return Resp.error("failed to get the status of the job",400)
  }
  return Resp.success(status)
}