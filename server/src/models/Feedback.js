const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['farmer', 'dealer', 'admin'],
            required: true,
        },
        category: {
            type: String,
            enum: ['concern', 'feature_request', 'bug', 'general'],
            default: 'concern',
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Feedback message is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
