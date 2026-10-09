const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            default: Date.now,
        },
        activityType: {
            type: String,
            enum: ['Fertilizer', 'Pesticide', 'Irrigation', 'Weeding', 'Harvesting', 'Other'],
            default: 'Other',
        },
        description: {
            type: String,
            trim: true,
            required: [true, 'Activity description is required'],
        },
        inventoryItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FarmerInventory',
        },
        quantityUsed: {
            type: Number,
            min: 0,
        },
    },
    { _id: true }
);

const cropSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Farmer ID is required'],
        },
        farm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Farm',
            required: [true, 'Farm ID is required'],
        },
        cropName: {
            type: String,
            required: [true, 'Crop name is required'],
            trim: true,
        },
        variety: {
            type: String,
            trim: true,
            default: '',
        },
        sowingDate: {
            type: Date,
            required: [true, 'Sowing date is required'],
        },
        expectedHarvestDate: {
            type: Date,
        },
        currentStage: {
            type: String,
            enum: ['Land Prep', 'Sowing', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting', 'Completed'],
            default: 'Sowing',
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['Active', 'Harvested', 'Archived'],
            default: 'Active',
        },
        activities: [activityLogSchema],
    },
    { timestamps: true }
);

cropSchema.index({ farmer: 1, farm: 1 });

module.exports = mongoose.model('Crop', cropSchema);
