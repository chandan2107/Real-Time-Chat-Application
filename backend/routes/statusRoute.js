import express from "express"

import { authMiddleware } from "../middleware/auth.middleware.js"
import { multerMiddleware } from "../config/cloudinaryConfig.js"
import { createStatus, deleteStatus, getStatus, viewStatus } from "../controllers/status.controller.js"


const statusRouter = express.Router()


//protected route

statusRouter.post("/",authMiddleware,multerMiddleware,createStatus)
statusRouter.get("/",authMiddleware,getStatus)
statusRouter.put("/:statusId/view",authMiddleware,viewStatus)
statusRouter.delete("/:statusId", authMiddleware ,deleteStatus)




export default statusRouter

