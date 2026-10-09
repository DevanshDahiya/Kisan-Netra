const mongoose = require('mongoose');

const licensedDealerSchema = new mongoose.Schema(
    {
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        businessName: {
            type: String,
            trim: true,
            default: '',
        },
        ownerName: {
            type: String,
            trim: true,
            default: '',
        },
        emails: [
            {
                type: String,
                lowercase: true,
                trim: true,
            },
        ],
        phones: [
            {
                type: String,
                trim: true,
            },
        ],
        address: {
            type: String,
            trim: true,
            default: '',
        },
        district: {
            type: String,
            trim: true,
            default: '',
        },
        state: {
            type: String,
            default: 'Odisha',
            trim: true,
        },
        licenseValidUntil: {
            type: Date,
            default: null,
        },
        sourceFile: {
            type: String,
            default: '',
            trim: true,
        },
        importedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

licensedDealerSchema.index({ emails: 1 });

module.exports = mongoose.model('LicensedDealer', licensedDealerSchema);
