import React, { useEffect, useRef, useState } from 'react'
import { useUserStore } from '../../store/useUserStore'
import { useThemeStore } from '../../store/useThemeStore'
import { useChatStore } from '../../store/chatStore'
import {isToday,isYesterday,format} from "date-fns"
import whatsappImage from "../../images/whatsapp_image.png"
import {FaArrowLeft, FaEllipsisV, FaFile, FaImage, FaLock, FaPaperclip, FaPaperPlane, FaSmile, FaTimes, FaVideo} from "react-icons/fa"
import MessageBubble from './MessageBubble'
import EmojiPicker from "emoji-picker-react"
import VideoCallManager from '../VideoCall/VideoCallManager'
import { getSocket } from '../../services/chat.service'
import { useVideoCallStore } from '../../store/vedioCallStore'

const isValidate=(date)=>{
  return date instanceof Date & !isNaN(date)
}
const ChatWindow = ({selectedContact,setSelectedContact}) => {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [filePreview, setFilePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const typingTimeoutRef = useRef(null)
  const messageEndRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const fileInputRef = useRef(null)
  const {theme}=useThemeStore()
  const {user}=useUserStore()
  const socket=getSocket()


  const {
  messages,
  loading,
  sendMessage,
  receiveMessage,
  fetchMessages,
  fetchConversations,
  conversations,
  currentConversation,
  isUserTyping,
  startTyping,
  stopTyping,
  getUserLastSeen,
  isUserOnline,
  deleteMessage,
  addReaction,
  cleanup
} = useChatStore();

const online=isUserOnline(selectedContact?._id)
const lastSeen=getUserLastSeen(selectedContact?._id)
const isTyping=isUserTyping(selectedContact?._id)



useEffect(() => {
  if(selectedContact?._id && conversations?.data?.length> 0) {
    const conversation = conversations?.data?.find((conv) => 
      conv.participants.some((participant) => participant._id === selectedContact?._id))
    if(conversation?._id) {
      fetchMessages(conversation._id)
    } else {
      useChatStore.setState({ messages: [], currentConversation: null })
    }
  } else if (selectedContact?._id) {
    useChatStore.setState({ messages: [], currentConversation: null })
  }
},[selectedContact,conversations])

useEffect(() => {
  fetchConversations();
},[]);

const scrollToBottom=()=>{
  messageEndRef.current?.scrollIntoView({behavior:"auto"})
}


useEffect(() => {
  scrollToBottom();
},[messages])

useEffect(() => {
  if(message && selectedContact){
    startTyping(selectedContact?._id);

    if(typingTimeoutRef.current){
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedContact?._id)
    },2000);

  }
  return () => {
    if(typingTimeoutRef.current){
      clearTimeout(typingTimeoutRef.current)
    }
  }
},[message,selectedContact,startTyping,stopTyping])

const handleFileChange=(e)=>{
  const file=e.target.files[0]
  if(file){
    setSelectedFile(file)
    setShowFileMenu(false)
    if(file.type.startsWith("image/")  || file.type.startsWith("video/")){
      setFilePreview(URL.createObjectURL(file))
    }
  }
}

const handleSendMessage=async ()=>{

  if(!selectedContact) return
  setFilePreview(null)
  try {
    const formData=new FormData()
    formData.append("senderId",user?._id)
    formData.append("receiverId",selectedContact?._id)

    const status=online ? "delivered":"send"
    formData.append("messageStatus",status)
    if(message.trim()){
      formData.append("content",message.trim())
    }

    if(selectedFile){
      formData.append("media",selectedFile,selectedFile.name)
    }

    if(!message.trim() && !selectedFile) return 
    await sendMessage(formData)
    fetchConversations()

    //clear state
    setMessage("")
    setFilePreview(null)
    setSelectedFile(null)
    setShowFileMenu(false)
  } catch (error) {
    console.error("Failed to send message",error)
  }
}


const renderDateSeparator=(date)=>{
  if(!isValidate(date)){
    return null
  }


  let dateString;
  if(isToday(date)){
    dateString="Today"
  }
  else if(isYesterday(date)){
    dateString="Yesterday"
  }
  else{
    dateString=format(date,"EEEE, MMMM d")
  }

  return (
    <div className='flex justify-center my-3'>
      <span className={`px-3 py-1 rounded-lg text-xs font-medium shadow-2xs uppercase tracking-wide ${theme === "dark" ? "bg-[#182229] text-[#8696a0]" : "bg-white text-[#54656f]"}`}>
        {dateString}
      </span>
    </div>
  )
}


const groupedMessages=Array.isArray(messages)? messages.reduce((acc,message)=>{
    if(!message.createdAt) return acc
    const date=new Date(message.createdAt)
    if(isValidate(date)){
      const dateString=format(date,"yyyy-MM-dd")
      if(!acc[dateString]){
        acc[dateString]=[]
      }
      acc[dateString].push(message)
    }
    else{
      console.error("Invalid date for message",message)
    }
    return acc
  },{}) : {}

  const handleReaction=(messageId,emoji)=>{
    addReaction(messageId,emoji,user?._id)
  }

  const handleVideoCall = () => {
  if(selectedContact && online) {
    const { initiateCall } = useVideoCallStore.getState();

    const avartar = selectedContact?.profilePicture;

    initiateCall (
      selectedContact?._id,
      selectedContact?.username,
      avartar,
      "video"
    )
  }else{
    alert("User is offline. Cannot initiate the call")
  }
}

  

  if (!selectedContact) {
    return (
      <div
        className={`flex-1 flex flex-col items-center justify-center h-screen text-center p-6 border-b-[6px] border-[#25d366] ${
          theme === 'dark' ? 'bg-[#222e35]' : 'bg-[#f0f2f5]'
        }`}
      >
        <div className="max-w-md flex flex-col items-center">
          <img
            src={whatsappImage}
            alt="chat-app"
            className="w-64 sm:w-72 h-auto opacity-90 mb-6"
          />
          <h2
            className={`text-2xl sm:text-3xl font-light mb-3 tracking-tight ${
              theme === 'dark' ? 'text-[#e9edef]' : 'text-[#41525d]'
            }`}
          >
            Select a conversation to start chatting
          </h2>
          <p
            className={`text-sm leading-relaxed max-w-sm mb-6 ${
              theme === 'dark' ? 'text-[#8696a0]' : 'text-[#667781]'
            }`}
          >
            Choose a contact from the list on the left to begin messaging
          </p>

          <p
            className={`text-xs mt-8 flex items-center justify-center gap-1.5 ${
              theme === 'dark' ? 'text-[#8696a0]' : 'text-[#8696a0]'
            }`}
          >
            <FaLock className="h-3 w-3" />
            Your personal messages are end-to-end encrypted
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 h-screen w-full flex flex-col overflow-hidden">
        {/* WhatsApp Chat Header */}
        <div
          className={`h-14 px-4 flex items-center justify-between border-b shrink-0 ${
            theme === 'dark'
              ? 'bg-[#202c33] border-[#222e35] text-[#e9edef]'
              : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21]'
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              className="p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 md:hidden focus:outline-none cursor-pointer"
              onClick={() => setSelectedContact(null)}
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>

            <img
              src={selectedContact?.profilePicture}
              alt={selectedContact?.username}
              className="w-10 h-10 rounded-full object-cover shrink-0 cursor-pointer"
            />

            <div className="min-w-0 flex-1 cursor-pointer">
              <h2 className="font-medium text-sm leading-tight truncate">
                {selectedContact?.username}
              </h2>

              {isTyping ? (
                <p className="text-xs text-[#00a884] font-medium animate-pulse">
                  typing...
                </p>
              ) : (
                <p
                  className={`text-xs truncate ${
                    online
                      ? "text-[#00a884] font-medium"
                      : theme === "dark"
                      ? "text-[#8696a0]"
                      : "text-[#667781]"
                  }`}
                >
                  {online
                    ? "online"
                    : lastSeen
                    ? `last seen ${format(new Date(lastSeen), "HH:mm")}`
                    : "offline"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              className={`p-2 rounded-full transition cursor-pointer ${
                theme === "dark"
                  ? "hover:bg-gray-700/60 text-[#aebac1]"
                  : "hover:bg-gray-200/60 text-[#54656f]"
              }`}
              onClick={handleVideoCall}
              title={online ? "Start video call" : "User is Offline"}
            >
              <FaVideo className="h-4 w-4" />
            </button>
            <button
              className={`p-2 rounded-full transition cursor-pointer ${
                theme === "dark"
                  ? "hover:bg-gray-700/60 text-[#aebac1]"
                  : "hover:bg-gray-200/60 text-[#54656f]"
              }`}
            >
              <FaEllipsisV className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Container with WhatsApp Wallpaper */}
        <div
          className={`flex-1 p-4 overflow-y-auto ${
            theme === "dark" ? "bg-[#0b141a]" : "bg-[#efeae2]"
          }`}
        >
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <React.Fragment key={date}>
              {renderDateSeparator(new Date(date))}
              {msgs
                .filter((msg) => {
                  const messageConversationId =
                    typeof msg.conversation === "object"
                      ? msg.conversation?._id
                      : msg.conversation

                  return (
                    String(messageConversationId) ===
                    String(currentConversation)
                  )
                })
                .map((msg) => (
                  <MessageBubble
                    key={msg._id || msg.tempId}
                    message={msg}
                    theme={theme}
                    currentUser={user}
                    onReact={handleReaction}
                    deleteMessage={deleteMessage}
                  />
                ))}
            </React.Fragment>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* File Preview */}
        {filePreview && (
          <div
            className={`relative p-3 border-t shrink-0 ${
              theme === "dark"
                ? "bg-[#202c33] border-[#222e35]"
                : "bg-[#f0f2f5] border-[#e9edef]"
            }`}
          >
            {selectedFile?.type.startsWith("video/") ? (
              <video
                src={filePreview}
                controls
                className="w-64 max-h-48 object-cover rounded-xl shadow-lg mx-auto"
              />
            ) : (
              <img
                src={filePreview}
                alt="file-preview"
                className="w-64 max-h-48 object-cover rounded-xl shadow-lg mx-auto"
              />
            )}
            <button
              onClick={() => {
                setSelectedFile(null)
                setFilePreview(null)
              }}
              className="absolute top-2 right-2 bg-gray-800/80 hover:bg-red-500 text-white rounded-full p-1.5 transition cursor-pointer"
            >
              <FaTimes className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* WhatsApp Message Input Bar */}
        <div
          className={`px-4 py-2.5 border-t flex items-center gap-2 relative shrink-0 ${
            theme === 'dark'
              ? "bg-[#202c33] border-[#222e35]"
              : "bg-[#f0f2f5] border-[#e9edef]"
          }`}
        >
          <button
            className={`p-2 rounded-full transition cursor-pointer focus:outline-none ${
              theme === 'dark'
                ? "text-[#8696a0] hover:text-[#e9edef] hover:bg-gray-700/50"
                : "text-[#54656f] hover:text-[#111b21] hover:bg-gray-200/60"
            }`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emojis"
          >
            <FaSmile className="h-5 w-5" />
          </button>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute left-4 bottom-16 z-50 shadow-2xl"
            >
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  setMessage((prev) => prev + emojiObject.emoji)
                  setShowEmojiPicker(false)
                }}
                theme={theme}
              />
            </div>
          )}

          <div className="relative">
            <button
              className={`p-2 rounded-full transition cursor-pointer focus:outline-none ${
                theme === 'dark'
                  ? "text-[#8696a0] hover:text-[#e9edef] hover:bg-gray-700/50"
                  : "text-[#54656f] hover:text-[#111b21] hover:bg-gray-200/60"
              }`}
              onClick={() => setShowFileMenu(!showFileMenu)}
              title="Attach"
            >
              <FaPaperclip className="h-5 w-5" />
            </button>

            {showFileMenu && (
              <div
                className={`absolute bottom-full left-0 mb-3 p-1.5 rounded-xl shadow-xl border w-44 z-50 ${
                  theme === "dark"
                    ? "bg-[#233138] border-[#222e35] text-[#e9edef]"
                    : "bg-white border-gray-100 text-[#111b21]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className={`flex items-center px-3 py-2 w-full text-sm rounded-lg transition-colors cursor-pointer ${
                    theme === "dark"
                      ? "hover:bg-[#182229]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <FaImage className="mr-3 text-[#00a884] h-4 w-4" /> Photos &
                  videos
                </button>

                <button
                  onClick={() => fileInputRef.current.click()}
                  className={`flex items-center px-3 py-2 w-full text-sm rounded-lg transition-colors cursor-pointer ${
                    theme === "dark"
                      ? "hover:bg-[#182229]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <FaFile className="mr-3 text-[#53bdeb] h-4 w-4" /> Document
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage()
              }
            }}
            placeholder="Type a message"
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm transition focus:outline-none ${
              theme === "dark"
                ? "bg-[#2a3942] text-white placeholder-[#8696a0]"
                : "bg-white text-[#111b21] placeholder-[#54656f] shadow-2xs"
            }`}
          />

          <button
            onClick={handleSendMessage}
            className={`p-2 rounded-full transition cursor-pointer focus:outline-none ${
              message.trim() || selectedFile
                ? "text-[#00a884] hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                : "text-[#8696a0] opacity-50 cursor-not-allowed"
            }`}
            title="Send"
          >
            <FaPaperPlane className="h-5 w-5" />
          </button>
        </div>
      </div>
      <VideoCallManager socket={socket} />
    </>
  )
}


export default ChatWindow
