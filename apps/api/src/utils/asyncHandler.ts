import type { NextFunction ,Request,Response} from "express";
import Resp from "./Resp";

export const asyncHandler = (fn:any)=>async (req:Request,res:Response,next:NextFunction)=>{
    try {
        await fn(req,res,next)
    }
    catch (error){
        if(error instanceof Error)
        res.json(Resp.error("error while calling the api",500,error))
    }
}