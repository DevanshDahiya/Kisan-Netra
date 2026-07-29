const User = require('../models/User');
const {generateToken , sendTokenCookie} = require('../utils/generateToken');
const {generateOTP , hashOTP , compareOTP , OTP_EXPIRY_MINUTES  , MAX_OTP_ATTEMPTS} = require('../utils/otp');
const {sendOTPEmail} = require('../utils/EmailService') ;

// route - > POST /api/auth/register 
const register = async(req , res , next) =>{
    try{
        const {name , email , password , role , phone} = req.body ; 
        const existingUser = await User.findOne({email}) ;
        if(existingUser){
            return res.status(400).json({
                message : 'Email already registered'  
            });
        }

        const user = await User.create({name , email , password , role , phone}) ;
        const token = generateToken(user._id , user.role) ;
        sendTokenCookie(res , token) ;

        res.status(201).json({
            user: {
                id: user._id  ,
                name : user.name ,
                email : user.email ,
                role: user.role
            },
        });
    }
    catch(err){
        next(err) ;
    }
};

// route POST /api/auth/login 
const login = async(req , res , next)=>{
    try{
        const {email , password} = req.body ;
        const user = await User.findOne({email}).select('+password') ;
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({
                message : 'Invalid login credentials' 
            });
        }
        const token = generateToken(user._id , user.role) ;
        sendTokenCookie(res , token) ;
        res.status(200).json({
            user : {
                id :user._id ,
                name : user.name ,
                email : user.email,
                role : user.role 
            },
        });
    }
    catch(err){
        next(err) ;
    }
};

//  route GET /api/auth/me 
const getMe  = async(req , res , next) =>{
    try{
        res.status(200).json({
            user : req.user 
        });
    }
    catch(err){
        next(err) ;
    }
};

// route POST /api/auth/forgot-password 
const forgotPassword = async(req , res , next) => {
    try{
        const {email} = req.body ; 
        const user = await User.findOne({email}) ;

        const genericMsg = {message : 'If that email is registered , an OTP has been sent.'};

        if(!user){
            return res.status(200).json(genericMsg) ;
        }

        const otp = generateOTP() ;
        // stroing the hashOTP 
        user.resetPasswordOTP = await hashOTP(otp) ;
        user.resetPasswordExpires = Date.now() + OTP_EXPIRY_MINUTES * 60 *1000  ; 
        user.resetOTPAttempts = 0 ;
        await user.save() ;

        await sendOTPEmail(user.email , otp) ;
        res.status(200).json(genericMsg) ;


    }
    catch(err){
        next(err) ;
    }
} ;

// route POST /api/auth/verify-otp 
const verifyOTP = async(req , res , next) => {
    try{
        const {email , otp} = req.body ; 
        const user = await User.findOne({email}).select('+resetPasswordOTP +resetPasswordExpires +resetOTPAttempts');

        if(!user || !user.resetPasswordOTP){
            return res.status(400).json({
                message : 'Invalid or expired OTP.'
            }) ;
        }

        if(user.resetOTPAttempts >= MAX_OTP_ATTEMPTS){
            return res.status(429).json({
                message : 'Too many incorrect attempts. Please request a new OTP',
            });
        }

        if(user.resetPasswordExpires < Date.now()){
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        const isMatch = await compareOTP(otp , user.resetPasswordOTP);
        if(!isMatch){
            user.resetOTPAttempts++ ; 
            await user.save() ;
            return res.status(400).json({
                message : 'Incorrect OTP' 
            });
        }

        res.status(200).json({
            message : 'OTP verified. You may now reset your password.' 
        });
    }
    catch(err){
        next(err) ; 
    }
} ; 


// route POST /api/auth/reset-password 
const resetPassword = async(req , res , next)=>{
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email }).select('+password +resetPasswordOTP +resetPasswordExpires +resetOTPAttempts');
    
        if (!user || !user.resetPasswordOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
    
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }
    
        const isMatch = await compareOTP(otp, user.resetPasswordOTP);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect OTP.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters.',
            });
        }

        user.password = newPassword;
        user.resetPasswordOTP = null;
        user.resetPasswordExpires = null;
        user.resetOTPAttempts = 0;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You may now login.' });
    }
    catch(err){
        next(err) ;
    }
};

module.exports  = {register , login , getMe , forgotPassword , verifyOTP , resetPassword};
