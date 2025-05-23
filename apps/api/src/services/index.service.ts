import { addJobs } from "../utils/Queue"
import Resp from "../utils/Resp"
import { uploadToS3 } from "../utils/uploadToS3"


export const handleUploadService  = async(bookImagePath:string)=>{
const bookPath = await uploadToS3(bookImagePath)
if(!bookPath){
  return  Resp.error("upload to s3 failed",400)
    
}
const jobId = await addJobs(bookPath,bookPath?.split("/")[1]?.split(".")[0])
if(!jobId){
  return  Resp.error("failed to push to queue",400)
    
}

return Resp.success({jobId},"Upload Was Successful Processing the Image")
 

}