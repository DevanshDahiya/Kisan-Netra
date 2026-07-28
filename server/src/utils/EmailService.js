const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOTPEmail = async (toEmail, otp) => {
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: toEmail,
        subject: 'kisan Netra - Password Reset OTP',
        text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.If you did not request this, please ignore this email.`,
        html: `<p>Your OTP for password reset is <strong>${otp}</strong>.</p><p>It expires in 10 minutes. If you did not request this, please ignore this email.</p>`
    });
};
module.exports = { sendOTPEmail };



