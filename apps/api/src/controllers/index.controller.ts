import type {Request,Response} from "express"
import Resp from "../utils/Resp";
import { getStatusOfAJobService, handleUploadService } from "../services/index.service";
import { asyncHandler } from "../utils/asyncHandler";




export const handleUpload=  asyncHandler(async (req:Request,res:Response)=>{
const bookImagePath = req.file?.path;
if(!bookImagePath){
res.json(Resp.error("error getting the path of the book image uploaded please reupload",400))
return
}
const response  =await  handleUploadService(bookImagePath)

res.json(response)
})

export const getStatusOfAJob= asyncHandler(async (req:Request,res:Response)=>{
    const jobId =  req.body;
    if(!jobId||!(typeof(jobId)=="string")){
        res.json(Resp.error("job Id is required and should be of string"))
    return
    }
    const response = await getStatusOfAJobService(jobId)
    res.json(response)
})