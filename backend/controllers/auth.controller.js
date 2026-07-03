

import { User } from "../models/user.model";
import { otpGenerate } from "../utils/otpGenerator";

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
            
        }
    } catch (error) {
        console.error("Error occurred while finding user:", error);
    }
}