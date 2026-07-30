const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    storeName: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    licenseNumber: {
        type: String,
        required: [true, 'Pesticide/fertilizer dealer licence number is requitred'],
        trim: true,

    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude , latitude] - mongoDB required order
            required: [true, 'Location coordinate is required'],
        },
    },
    contactPhone: {
        type: String,
        trim: true,
    },
    isVerified: {
        type: Boolean,
        default: false, // admin approve it after verifying
    },

}, { timestamps: true });


dealerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Dealer', dealerSchema);

