import mongoose from "mongoose";



const messageSchema = new mongoose.Schema({
    conversation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation",
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{type:String},
    imageOrVedio:{type:String},
    contentType:{type:String,enum:["image","vedio","text"]},
    reactions:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            emoji:String
        }
    ],
    messageStatus:{type:String,default:"send"}

    
    
 
},{timestamps:true})

export const Message=mongoose.model("Message",messageSchema);
