import express, { Router } from "express"
import { upload } from "../middlewares/multer.middleware"
import { getStatusOfAJob, handleUpload } from "../controllers/index.controller"


const router: Router= express.Router()



router.post("/upload", upload.single('bookimage'),handleUpload)
router.get("/statusofjob",getStatusOfAJob)



export default router