import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js"
import { Status } from "../models/status.model.js"
import { response } from "../utils/responseHandler.js"



const createStatus=async (req,res)=>{
    try {
        const {content,contentType}=req.body
        const userId=req.user.userId
        const file=req.file

        let mediaUrl=null
        let finalContentType=contentType || "text"

        //handle file upload
        if(file){
            const uploadFile=await uploadFileToCloudinary(file)
            if(!uploadFile?.secure_url){
                return response(res,400,"Failed to upload media")
            }
            mediaUrl=uploadFile?.secure_url

            if(file.mimetype.startsWith("image")){
                finalContentType="image"
            }else if(file.mimetype.startsWith("video")){
                finalContentType="video"
            }
            else{
                return response(res,400,"Unsupported file type")
            }
        }
        else if(content?.trim()){
            finalContentType="text"
        }
        else{
            return response(res,400,"Status content is required")
        }

        const expiresAt=new Date()
        expiresAt.setHours(expiresAt.getHours()+24)

        const status=new Status({
            user:userId,
            content:mediaUrl || content,
            contentType:finalContentType,
            expiresAt
        })
        await status.save()

        const populatedStatus=await Status.findOne(status?._id)
        .populate("user","username profilePicture")
        .populate("viewers","username profilePicture")

        //emit socket event
        if(req.io && req.socketUserMap){
            //broadcast to all users except creator
            for(const [connectedUserId,socketId] of req.socketUserMap){
                if(connectedUserId !==userId){
                    req.io.to(socketId).emit("new_status",populatedStatus)
                }
            }
        }

        return response(res,200,"Status created successfully",populatedStatus)
        
    } catch (error) {
        console.error(error)
        return response(res,500,"Internal server error")
    }
}


//get all status of user

const getStatus=async (req,res)=>{
    const userId=req.user.userId
    try {
        const statuses=await Status.find({
            expiresAt:{$gt:new Date()}
        })
        .populate("user","username profilePicture")
        .populate("viewers","username profilePicture")
        .sort({createdAt:-1})

        return response(res,200,"Statuses fetched successfully",statuses)
    } catch (error) {
        console.error(error)
        return response(res,500,"Internal server error")
    }

}


//users who viewed the status

const viewStatus=async (req,res)=>{
    const {statusId}=req.params
    const userId=req.user.userId
    try {
        const status = await Status.findById(statusId)
        if(!status){
            return response(res,404,"Status not found")
        }
        if(!status.viewers.includes(userId)){
            status.viewers.push(userId)
            await status.save()
            
            const updateStatus=await Status.findById(statusId)
            .populate("user","username profilePicture")
            .populate("viewers","username profilePicture")

            //emit socket event
            if(req.io && req.socketUserMap){
                //alert the user about status viewed
                const statusOwnerSocketId=req.socketUserMap.get(status.user._id.toString())
                if(statusOwnerSocketId){
                    const viewData={
                        statusId,
                        viewerId:userId,
                        totalViewers:updateStatus.viewers.length,
                        viewers:updateStatus.viewers
                    }
                    
                    res.io.to(statusOwnerSocketId).emit("status_viewed",viewData)
                }
                else{
                    console.log("Status owner not connected")
                }
            
        }
        }

        else{
            console.log("User already viewed the status")
        }

        
        return response(res,200,"Status viewed successfully")

    } catch (error) {
        console.error(error)
        return response(res,500,"Internal server error")
    }
}


const deleteStatus=async (req,res)=>{
    const {statusId}=req.params
    const userId=req.user.userId
    try {
        const status=await Status.findById(statusId)
        if(!status){
            return response(res,404,"Status not found")
        }
        if(status.user.toString() !==userId){
            return response(res,403,"Not authorized to delete this status")
        }
        await status.deleteOne()

        //socket event
        if(req.io && req.socketUserMap){
            
            for(const [connectedUserId,socketId] of req.socketUserMap){
                if(connectedUserId !==userId){
                    req.io.to(socketId).emit("status_deleted",statusId)
                }
            }
        }

        return response(res,200,"Status deleted successfully")
    } catch (error) {
        console.error(error)
        return response(res,500,"Internal server error")
    }

}



export {createStatus,getStatus,viewStatus,deleteStatus}