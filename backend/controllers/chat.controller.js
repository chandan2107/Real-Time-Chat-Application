import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js"
import { Conversation } from "../models/conversation.model.js"
import { Message } from "../models/message.model.js"
import { response } from "../utils/responseHandler.js"




const sendMessage=async (req,res)=>{
    try {
        const {senderId,receiverId,content,messageStatus}=req.body
        const file=req.file

        const participants=[senderId,receiverId].sort()

        //check if conversation already exists 
        const conversation=await Conversation.findOne({
            partitipants:participants
        })
        if(!conversation){
            conversation =new Conversation({
                participants
            })
            await conversation.save()
        }

        let imageOrVideoUrl=null
        let contentType=null

        //handle file upload
        if(file){
            const uploadFile=await uploadFileToCloudinary(file)
            if(!uploadFile?.secure_url){
                return response(res,400,"Failed to upload media")
            }
            imageOrVideoUrl=uploadFile?.secure_url

            if(file.mimetype.startsWith("image")){
                contentType="image"
            }else if(file.mimetype.startsWith("video")){
                contentType="video"
            }
            else{
                return response(res,400,"Unsupported file type")
            }
        }
        else if(content?.trim()){
            contentType="text"
        }
        else{
            return response(res,400,"Message content is required")
        }

        const message=new Message({
            conversation:conversation?._id,
            sender:senderId,
            receiver:receiverId,
            content,
            contentType,
            imageOrVideoUrl,
            messageStatus
        })
        await message.save()
        if(message?.content){
            conversation.lastMessage=message?.id
        }
        conversation.unreadCount+=1
        await conversation.save()

        const populatedMessage=await Message.findOne(message?._id)
        .populate("sender","username profilePicture")
        .populate("receiver","username profilePicture")





        return response(res,200,"Message content sent successfully",populatedMessage)
        
    } catch (error) {
        console.error(error)
        return response(res,500,"Internal server error")
    }
}


//get all conversation

const getConversation=async (req,res)=>{
    const userid=req.user.userId
    try {
        const conversation=await Conversation.find({
            partitipants:userId
        }).populate('participants',"username profilePicture isOnline lastSeen")
        .populate({
            path:"lastMessage",
            populate:{
                path:"sender receiver",
                select:"username profilePicture"
            }
        }).sort({updatedAt:-1})

        return response(res,200,"Conversation fetched successfully",conversation)
    } catch (error) {
        console.error(error)
        return response(res,500,"Internal server error")
    }

}


//get messages of specific conversation

const getMessages=async (req,res)=>{
    const {conversationId}=req.params
    const userId=req.user.userId
    try {
        const conversation = await Conversation.findById(conversationId)
        if(!conversation){
            return response(res,404,"conversation not found")
        }
        if(!conversation.participants.include(userId)){
            return response(res,404,"Not authorized to view this conversation")
        }

        const messages=await Message.find({conversation:conversationId})
        .populate("sender","username profilePicture")
        .populate("receiver","username profilePicture")
        .sort("createdAt")

        await Message.updateMany(
            {
                conversation:conversationId,
                receiver:userId,
                messageStatus:{
                    $in:["send","delivered"]
                }
            },
            {$set:
                {messageStatus:"read"}
            }
        )
        conversation.unreadCount=0
        await conversation.save()
        return response(res,200,"Message retrieved",messages)

    } catch (error) {
        console.error(error)
        return response(res,500,"Internal server error")
    }
}


const markAsRead=async (req,res)=>{
    const {messageIds}=req.body
    const userId=req.user.userid
    try {
        let messages=Message.find({
            _id:{
                $in :messageIds
            },
            receiver:userId
        })

        await messages.updateMany(
            {_id:{$in:messageIds},receiver:userId},
            {$set:{messageStatus:"read"}}
        )

        return response(res,200,"Message marked as read",messages)
    } catch (error) {
        console.error(error)
        return response(res,500,"Internal server error")
    }
}

const deleteMessage=async (req,res)=>{
    const {messageId}=req.params
    const userId=req.user.userid
    try {
        const message=await Message.findById(messageId)
        if(!message){
            return response(res,404,"Message not found")
        }
        if(message.sender.toString() !==userId){
            return response(res,403,"Not authorized to delete this message")
        }
        await message.deleteOne()

        return response(res,200,"Message deleted successfully")
    } catch (error) {
        console.error(error)
        return response(res,500,"Internal server error")
    }

}







export {sendMessage,getConversation,getMessages,markAsRead,deleteMessage}