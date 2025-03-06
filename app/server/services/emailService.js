import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Account - Cancerian Capital',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #5b21b6; text-align: center;">Verify Your Account</h2>
          <p>Thank you for registering with Cancerian Capital. Please use the following OTP to verify your account:</p>
          <div style="text-align: center; padding: 15px; background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
            &copy; 2025 Cancerian Capital. All rights reserved.
          </p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};
