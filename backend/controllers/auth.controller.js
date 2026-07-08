

import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js";
import { User } from "../models/user.model.js";
import { sendOtpToEmail } from "../services/email.service.js";
import { sendOtpToPhone } from "../services/twilio.service.js";
import { verifyOtpPhone } from "../services/twilio.service.js";
import { generateToken } from "../utils/generateToken.js";
import { otpGenerate } from "../utils/otpGenerator.js";
import { response } from "../utils/responseHandler.js";

//sending otp
const sendOtp = async (req, res) => {
    const {phoneNumber,phoneSuffix,email} = req.body;
    const otp=otpGenerate()
    const expiry=new Date(Date.now()+5*60*1000)
    let user
    try {
        if(email){
            user = await User.findOne({email})
            if(!user){
                user=new User({email})
            }

            user.emailOtp=otp
            user.emailOtpExpiry=expiry
            await user.save()
            await sendOtpToEmail(email,otp)
            return response(res,200,"OTP sent to your email",{email})
        }

        if(!phoneNumber || !phoneSuffix){
            return response(res,400,"Phone number and suffix are required")
        }

        const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
        user = await User.findOne({phoneNumber})
        if(!user){
            user= await new User({phoneNumber,phoneSuffix})
        }
        await user.save()
        await sendOtpToPhone(fullPhoneNumber)
        return response(res,200,"OTP sent to your phone",user)

    } catch (error) {
        console.error(error);
        return response(res,500,"Internal server error")
    }
}


const verifyOtp = async (req, res) => {
    const {phoneNumber,phoneSuffix,email,otp} = req.body;

    try{
        let user

        //email login verification
        if(email){
            user = await User.findOne({email})
            if(!user){
                return response(res,404,"User not found")
            }

            const now =new Date()
            if(!user.emailOtp || String(user.emailOtp) !== String(otp) || now>new Date(user.emailOtpExpiry)){
                return response(res,400,"Invalid or expired OTP")
            }
            user.isVerified=true
            user.emailOtp=null
            user.emailOtpExpiry=null
            await user.save()
        }
        else{
            //phone login verification
            if(!phoneNumber || !phoneSuffix){
                return response(res,400,"Phone number and suffix are required")
            }
            
            const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
            user = await User.findOne({phoneNumber})

            if(!user){
                return response(res,404,"User not found")
            }

            const result= verifyOtpPhone(fullPhoneNumber,otp)

            if(result.status!=="approved"){
                return response(res,400,"Invalid or expired OTP")
            }
            user.isVerified=true
            await user.save()

        }

        //generate token
        const token = generateToken(user?._id)
        res.cookie("auth_token",token,{
            httpOnly:true,
            maxAge:365*24*60*60*1000
        })
        return response(res,200,"OTP verified successfully",{token,user})

        

        
        
    }catch(error){
        console.error(error)
        return response(res,500,"Internal server error")
    }
}


//setup the profile image and username
const updateProfile = async (req,res)=>{
    const {username,agreed,about}=req.body
    const {userId}=req.user.userId
    try {
        const user=await User.findOne({userId})
        const file = req.file
        if(file){
            const uploadResult=await uploadFileToCloudinary(file)
            console.log(uploadResult)
            user.profilePicture=uploadResult?.secure_url
        }
        else if(req.body.profilePicture){
            user.profilePicture=req.body.profilePicture
        }

        if(username){ user.username=username }
        if(agreed){ user.agreed=agreed}
        if(about){ user.about = about}

        return response(res,200,"user profile updated sucessfully",user)
    } catch (error) {
        console.error(error);
        return response(res,500,"Internal server error")
    }
}

export {sendOtp,verifyOtp,updateProfile}

