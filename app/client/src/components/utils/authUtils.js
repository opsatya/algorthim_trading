export const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };
  
  export const validatePassword = (password) => {
    return password.length >= 8;
  };
  
  export const generateOTP = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let otp = '';
    for (let i = 0; i < 8; i++) {
      otp += chars[Math.floor(Math.random() * chars.length)];
    }
    return otp;
  };    