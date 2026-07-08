import express from "express"
import { sendOtp, updateProfile, verifyOtp } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { multerMiddleware } from "../config/cloudinaryConfig.js"

const authRouter = express.Router()


authRouter.post("/send-otp",sendOtp)
authRouter.post("/verify-otp",verifyOtp)


//protected route

authRouter.post("/update-profile", authMiddleware , multerMiddleware ,updateProfile)


export default authRouter

