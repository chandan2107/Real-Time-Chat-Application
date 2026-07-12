import express from "express"

import { authMiddleware } from "../middleware/auth.middleware.js"
import { multerMiddleware } from "../config/cloudinaryConfig.js"
import { deleteMessage, getConversation, getMessages, markAsRead, sendMessage } from "../controllers/chat.controller.js"

const chatRouter = express.Router()


//protected route

chatRouter.post("/send-message",authMiddleware,multerMiddleware,sendMessage)
chatRouter.get("/conversations",authMiddleware,getConversation)
chatRouter.get("/conversations/:conversationId/messages",authMiddleware,getMessages)
chatRouter.put("/messages/read", authMiddleware ,markAsRead)
chatRouter.delete("/messages/:messageId", authMiddleware ,deleteMessage)




export default chatRouter

