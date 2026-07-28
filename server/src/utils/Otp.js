const bcrypt = require('bcryptjs');

// Generate a 6-digit numeric OTP as a string 

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
};

const compareOTP = async (candidateOTP, hashedOTP) => {
    return bcrypt.compare(candidateOTP, hashedOTP);
};

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

module.exports = { generateOTP, hashOTP, compareOTP, OTP_EXPIRY_MINUTES, MAX_OTP_ATTEMPTS };