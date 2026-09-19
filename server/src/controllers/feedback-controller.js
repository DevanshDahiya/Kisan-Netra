const Feedback = require('../models/Feedback');

// @route POST /api/feedback - Create feedback (Farmer / Dealer)
const createFeedback = async (req, res, next) => {
    try {
        const { subject, message, category } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required.' });
        }

        const feedback = await Feedback.create({
            user: req.user._id,
            role: req.user.role,
            category: category || 'concern',
            subject,
            message,
        });

        res.status(201).json({ feedback, message: 'Thank you! Your feedback/concern has been submitted successfully.' });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/feedback - Get all feedbacks (Admin only)
const getAllFeedback = async (req, res, next) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', 'name email phone role')
            .sort({ createdAt: -1 });

        res.status(200).json({ count: feedbacks.length, feedbacks });
    } catch (err) {
        next(err);
    }
};

// @route PATCH /api/feedback/:id/status - Update feedback status (Admin only)
const updateFeedbackStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email phone role');

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found.' });
        }

        res.status(200).json({ feedback, message: 'Feedback status updated.' });
    } catch (err) {
        next(err);
    }
};

module.exports = { createFeedback, getAllFeedback, updateFeedbackStatus };
