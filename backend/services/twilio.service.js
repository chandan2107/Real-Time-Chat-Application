import twilio from "twilio";

//twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

//send otp to phoneNo
const sendOtpToPhone = async (phoneNumber) => {
    try{
        console.log("Sending OTP to phone number:", phoneNumber);
        if(!phoneNumber){
            throw new Error("Phone number is required");
        }
        const response= await client.verify.v2.services(serviceSid).verifications.create({
                to: phoneNumber,
                channel: "sms" 
            })
        console.log("OTP response" ,response)
        return response

    } catch (error) {
        throw new Error("Error sending OTP:", error);

    }
}

//verify
const verifyOtp = async (phoneNumber, otp) => {
    try{
        console.log("This is my OTP ",otp)
        console.log("Verifying OTP for phone number:", phoneNumber);
        const response= await client.verify.v2.services(serviceSid).verificationChecks.create({
                to: phoneNumber,
                code: otp
            })
        console.log("OTP verification response" ,response)
        return response

    } catch (error) {
        throw new Error("Error verifying OTP:", error);

    }
}


export { sendOtpToPhone, verifyOtp };

