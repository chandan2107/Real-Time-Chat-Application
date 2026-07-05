

import { User } from "../models/user.model";
import { sendOtpToEmail } from "../services/email.service";
import { sendOtpToPhone } from "../services/twilio.service";
import { otpGenerate } from "../utils/otpGenerator";
import { response } from "../utils/responseHandler";

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
        if(email){
            user = await User.findOne({email})
            if(!user){
                return response(res,404,"User not found")
            }
        }
        
        
    }
}