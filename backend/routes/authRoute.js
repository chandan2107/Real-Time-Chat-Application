import express from "express"
import { checkAuthenticated, getAllUsers, logout, sendOtp, updateProfile, verifyOtp } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { multerMiddleware } from "../config/cloudinaryConfig.js"

const authRouter = express.Router()


authRouter.post("/send-otp",sendOtp)
authRouter.post("/verify-otp",verifyOtp)
authRouter.get("/logout",logout)


//protected route

authRouter.put("/update-profile", authMiddleware , multerMiddleware ,updateProfile)

authRouter.get("/check-auth",authMiddleware,checkAuthenticated)

authRouter.get("/users",authMiddleware,getAllUsers)


export default authRouter

