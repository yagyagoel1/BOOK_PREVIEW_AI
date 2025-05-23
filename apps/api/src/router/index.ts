import express, { Router } from "express"
import { upload } from "../middlewares/multer.middleware"
import { handleUpload } from "../controllers/index.controller"


const router: Router= express.Router()



router.post("/upload", upload.single('bookimage'),handleUpload)




export default router