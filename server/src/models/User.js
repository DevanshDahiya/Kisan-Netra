const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true, // ensures no duplicate email
            lowercase: true, // stores in lowercase
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address",],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minLength: 6,
            select: false, // never return password in queries 
        },
        role: {
            type: String,
            enum: ['farmer', 'dealer', 'admin'],
            default: 'farmer',
        },
        phone: {
            type: String,
            trim: true,
        },
        // otp password reset fields 
        resetPasswordOTP: {
            type: String,
            select: false, // never leak this on normal queries either
        },
        resetPasswordExpires: {
            type: Date,
            select: false,
        },
        resetOTPAttempts: {
            type: Number,
            default: 0,
            select: false,
        },
    },
    { timestamps: true }
);

// Hash password before saving, only if it was modified 
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Instance method to compare a plaintext password against the stored hash 
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
