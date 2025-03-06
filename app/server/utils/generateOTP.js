export const generateOTP = () => {
  // Generate an 8-digit numerical OTP
  let otp = '';
  
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  
  return otp;
};