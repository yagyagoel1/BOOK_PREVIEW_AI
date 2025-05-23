import type {Request,Response} from "express"
import { uploadToS3 } from "../utils/uploadToS3";
import Resp from "../utils/Resp";
import { handleUploadService } from "../services/index.service";





export const handleUpload= async(req:Request,res:Response)=>{
const bookImagePath = req.file?.path;
if(!bookImagePath){
res.json(Resp.error("error getting the path of the book image uploaded please reupload",400))
return
}
const response  =  handleUploadService(bookImagePath)

res.json(response)
}