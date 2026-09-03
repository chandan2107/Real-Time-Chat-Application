import {create} from "zustand"
import { axiosInstance } from "../services/url.service"
import { getSocket } from "../services/chat.service"


const useLayoutStore=create((set,get)=>({
    conversations:[],
    currentConversation:null,
    messages:[],
    loading:false,
    error:null,
    onlineUsers:new Map(),
    typingUsers:new Map(),



    //socket event listeners setup
    initsocketListeners:()=>{
        const socket=getSocket()
        if(!socket) return

        socket.off("receive_message")
        socket.off("user_typing")
        socket.off("user_status")
        socket.off("message_send")
        socket.off("message_error")
        socket.off("message_deleted")


        //confirm message delivery
        socket.on("message_send",(message)=>{
            set((state)=>({
                messages:state.messages.map((msg)=> msg._id===message._id ? {...msg}:msg)
            }))
        })

        //update message status
        socket.on("message_status_update",({messageId,messageStatus})=>{
            set((state)=>({
                messages:state.messages.map((msg)=> msg._id===messageId ? {...msg,messageStatus}:msg)
            }))
        })

        //handle reaction on message
        socket.on("reaction_update",({messageId,reaction})=>{
            set((state)=>({
                messages:state.messages.map((msg)=> msg._id===messageId ? {...msg,reactions}:msg)
            }))
        })

        //handle remove message from local state
        socket.on("message_deleted",({deletedMessageId})=>{
            set((state)=>({
                messages:state.messages.filter((msg)=> msg._id!==deletedMessageId )
            }))
        })

        //handle message sending errors
        socket.on("message_error",(error)=>{
            console.error("message error",error)
        })

        //listener for typing users
        socket.on("user_typing",({userId,conversationId,isTyping})=>{
            set((state)=>{
                const newTypingUsers=new Map(state.typingUsers)
                if(!newTypingUsers.has(conversationId)){
                    newTypingUsers.set(conversationId,new Set())
                }

                const typingSet=newTypingUsers.get(conversationId)
                if(isTyping){
                    typingSet.add(userId)
                }
                else{
                    typingSet.delete(userId)
                }

                return {typingUsers:newTypingUsers}
                
            })
        })

        //track user online/offline status
        socket.on("user_status",({userId,isOnline,lastSeen})=>{
            set((state)=>{
                const newOnlineUsers=new Map(state.onlineUsers)
                newOnlineUsers.set(userId,{isOnline,lastSeen})
                return {onlineUsers:newOnlineUsers}
            })
        })

        //emit status to all conversations

        const {conversations}=get()
        if(conversations?.data?.length>0){
            conversations.data?.forEach((conv)=>{
                const otherUser=conv.participants.find(
                    (p)=> p._id !=get().currentUser._id
                )

                if(otherUser._id){
                    socket.emit("get_user_status",otherUser._id,(status)=>{
                        set((state)=>{
                            const newOnlineUsers=new Map(state.onlineUsers)
                            newOnlineUsers.set(state.userId,{
                                isOnline:state.isOnline,
                                lastSeen:state.lastSeen
                            })
                            return {onlineUsers:newOnlineUsers}
                        })
                    })
                }
            })
        }



    },

    setCurrentUser:(user)=>set({currentUser:user}),

    fetchConversations :async ()=>{
        set({loading:true,error:null})
        try {
            const {data}=await axiosInstance.get("/chats/conversations")
            set({conversations:data,loading:false}),

            get().initsocketListeners()
            return data
        } catch (error) {
            set({
                error:error?.response?.data?.message  || error?.message,
                loading:false
            })
            return null
        }
    },

    //fetch message for a conversation
    fetchMessages: async (conversationId)=>{
        if(!conversationId) return
        set({loading:true,error:null})
        try {
            const {data}=await axiosInstance.get(`/chats/conversations/${conversationId}/messages`)
            const messageArray=data.data ||data || []
            set({
                messages:messageArray,
                currentConversation:conversationId,
                loading:false
            })

            //mark unread message as read

        } catch (error) {
            set({
                error:error?.response?.data?.message  || error?.message,
                loading:false
            })
            return []
        }

    },

    //send message in real time
    sendMessage:async (FormData)=>{

    },


    receiveMessage:async (message)=>{
        if(!message) return

        const {currentConversation,currentUser,messages}=get()
        const messageExists=message.some((msg)=>msg._id===message._id)
        if(messageExists) return

        if(message.conversation===currentConversation){
            set((state)=>({
                messages:[...state.messages,message]
            }))
        }
    }

})
)

export {useLayoutStore}