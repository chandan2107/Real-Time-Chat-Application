import nodemailer from "nodemailer"
import "dotenv/config"


const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
  
});


transporter.verify((error, success) => {
    if (error) {
        console.error("Error verifying email transporter", error);
    } else {
        console.log("Email transporter is ready to send emails.");
    }
});

export const sendOtpToEmail = async (email, otp) => {
    const html = `
<div style="font-family: Arial, Helvetica, sans-serif; background:#f5f5f5; padding:40px 20px;">
  <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:10px; padding:35px; text-align:center;">

    <h2 style="color:#25D366; margin-bottom:10px;">
      Chat Application using Socket.io
    </h2>

    <p style="color:#555; font-size:15px;">
      Use the OTP below to verify your account.
    </p>

    <div style="
      display:inline-block;
      margin:25px 0;
      padding:15px 30px;
      background:#f0fff4;
      border:1px solid #25D366;
      border-radius:8px;
      font-size:32px;
      font-weight:bold;
      letter-spacing:6px;
      color:#128C7E;
    ">
      ${otp}
    </div>

    <p style="color:#666; font-size:14px;">
      This OTP is valid for <strong>5 minutes</strong>.
    </p>

    <p style="color:#999; font-size:13px; margin-top:25px;">
      If you didn't request this OTP, you can safely ignore this email.
    </p>
    <p style="color:#999; font-size:13px; margin-top:18px;">
        \u00A92026 Chandan Naik 
    </p>

  </div>
</div>
`;

    await transporter.sendMail({
        from: `Real-Time Chat App <${process.env.EMAIL_USER}>` ,
        to: email,
        subject:"Your OTP for Verification",
        html
    })

}



