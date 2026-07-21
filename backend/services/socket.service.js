import {Server} from "socket.io"
import { User } from "../models/user.model.js"
import { Message } from "../models/message.model.js"

//map to store online users---userId ,socketId

const onlineUsers=new Map()

//map to track typing status---userId->[conversation]:boolean

const typingUsers=new Map()

const initializeSocket=(server)=>{
    const io=new Server(server,{
        cors:{
            origin:process.env.FRONTEND_URL,
            credentials:true,
            methods:["GET","POST","DELETE","PUT","OPTIONS"],
        },
        pingTimeout:60000 //disconnect after 60 secs if inactive

    });



    //when new connection is establlished
    io.on("connection",(socket)=>{
        console.log(`User connected eith socket ID: ${socket.id}`)
        let userId=null


        //handle user connection and mark them online in db

        socket.on("user_connected",async (connectingUserId)=>{
            try {
                userId=connectingUserId
                onlineUsers.set(userId,socket.id)
                socket.join(userId)

                //update user Status in db
                await User.findByIdAndUpdate(userId,{
                    isOnline:true,
                    lastSeen:new Date()
                })

                //notify all user that this user is online
                io.emit("user_status",{userId,isOnline:true})
            } catch (error) {
                console.error("Error handling user connection",error)
            }
        })

        //Return online status of requested user

        socket.on("get_user_status",(requestedUserId,callback)=>{
            const isOnline=onlineUsers.has(requestedUserId)
            callback({
                userId:requestedUserId,
                isOnline,
                lastSeen:isOnline ? new Date():null
            })
            
        })


        //forward message to receiver if online
        socket.on("send_message",async (message)=>{
            try {
                const receiverSocketId=onlineUsers.get(message.receiver?._id)
                if(receiverSocketId){
                    io.to(receiverSocketId).emit("receive_message",message)
                }
            } catch (error) {
                console.error("Error sending message",error)
                socket.emit("message_error",{error:"Failed to send message"})
            }
        })

        
        //update message as read and notify sender 
        socket.on("message_read",async (messageIds,senderId)=>{
            try {
                await Message.updateMany(
                    {_id:{$in:messageIds}},
                    {$set:{messageStatus:"read"}}
                )

                const senderSocketId=onlineUsers.get(senderid)
                if(senderSocketId){
                    messageIds.forEach((messageId)=>{
                        io.to(senderSocketId).emit("message_status_update",{
                            messageId,
                            messageStatus:"read"
                        })
                    })
                }
            } catch (error) {
                console.error("Error sending message",error)
            }
        })


        //handle typing start event and auto stop after 3 sec
        socket.on("typing_start",async (conversationId,receiverId)=>{
            if(!userId || !conversationId || !receiverId){
                return;
            }

            if(!typingUsers.has(userId)){
                typingUsers.set(userId,{})
            }

            const userTyping=typingUsers.get(userId)

            userTyping[conversationId]=true

            //clear any existing timeout
            if(userTyping[`${conversationId}_timeout`]){
                clearTimeout(userTyping[`${conversationId}_timeout`])
            }

            //autostop after 3sec
            userTyping[`${conversationId}_timeout`] =setTimeout(()=>{
                userTyping[conversationId]=false
                socket.to(receiverId).emit("user_typing",{
                    userId,
                    conversationId,
                    isTyping:false
                })
            },3000)

            //notify receiver
            socket.to(receiverId).emit("user_typing",{
                    userId,
                    conversationId,
                    isTyping:true
            })
        })

        socket.on("typing_stop",({conversationId,receiverId})=>{
             if(!userId || !conversationId || !receiverId){
                return;
            }

            if(typingUsers.has(userId)){
                const userTyping=typingUsers.get(userId)
                userTyping[conversationId]=false

            if(userTyping[`${conversationId}_timeout`]){
                clearTimeout(userTyping[`${conversationId}_timeout`])
                delete userTyping[`${conversationId}_timeout`]
            }

            }

            socket.to(receiverId).emit("user_typing",{
                userId,
                conversationId,
                isTyping:false
            })

            
        })

        //Add or update reaction
        socket.on("add_reaction",async ({messageId,emoji,userId,reactionUserId})=>{
            try {
                const message=await Message.findById(messageId)
                if(!message){
                    return;
                }
                const existingIndex=message.reactions.findIndex(
                    (r)=>{
                        r.user.toString() === reactionUserId
                    }
                )

                if(existingIndex > -1){
                    const existing=message.reactions(existingIndex)
                    if(existing.emoji===emoji){
                        //remove same reaction
                        message.reactions.splice(existingIndex,1)
                    }
                    else{
                        //change emoji
                        message.reactions[existingIndex].emoji=emoji
                    }
                }
                else{
                    //add new reaction
                    message.reactions.push({user:reactionUserId,emoji})
                }
                await message.save()

                const populatedMessage=await Message.findOne(message?._id)
                .populate("sender","username profilePicture")
                .populate("receiver","username profilePicture")
                .populate("reactions.user","username")

                const reactionUpdated={
                    messageId,
                    reactions:populatedMessage.reactions
                }

                const senderSocket=onlineUsers.get(populatedMessage.sender?._id.toString())
                const receiverSocket=onlineUsers.get(populatedMessage.receiver?._id.toString())

                if(senderSocket){
                    io.to(senderSocket).emit("reaction_update",reactionUpdated)
                }
                if(receiverSocket){
                    io.to(receiverSocket).emit("reaction_update",reactionUpdated)
                }
            } catch (error) {
                console.error("Error handling reactions",error)
            }
        })

    //handle disconnection and mark user offline

    const handleDisconnected=async (req,res)=>{
        if(!userId) return;

        try {
            onlineUsers.delete(userId)

            //clear all typing timeouts
            if(typingUsers.has(userId)){
                const userTyping=typingUsers.get(userId)
                Object.keys(userTyping).forEach((key)=>{
                    if(key.endsWith("_timeout")){
                        clearTimeout(userTyping[key])
                    }
                })
                typingUsers.delete(userId)
            }
            await User.findByIdAndUpdate({
                isOnline:false,
                lastSeen:new Date()
            })

            io.emit("user_status",{
                userId,
                isOnline:false,
                lastSeen:new Date()
            })

            socket.leave(userid),
            console.log(`user ${userId} is disconnected`)

        } catch (error) {
            console.error("Error handling disconnection",error)
        }
    }

    //disconnect event
    socket.on("disconnect",handleDisconnected)

    })

    //attach online usermap to socket server for external user
    io.socketUserMap=onlineUsers
    return io

}

export {initializeSocket}