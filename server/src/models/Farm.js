const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Farmer ID is required'],
        },
        farmName: {
            type: String,
            required: [true, 'Farm name is required'],
            trim: true,
        },
        locationName: {
            type: String,
            trim: true,
            default: '',
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0],
            },
        },
        totalArea: {
            type: Number,
            required: [true, 'Total area is required'],
            min: [0, 'Area cannot be negative'],
        },
        areaUnit: {
            type: String,
            enum: ['acres', 'hectares', 'bigha'],
            default: 'acres',
        },
        soilType: {
            type: String,
            enum: ['Clay', 'Loam', 'Sandy', 'Black', 'Red', 'Silt', 'Alluvial', 'Other'],
            default: 'Loam',
        },
        irrigationType: {
            type: String,
            enum: ['Rainfed', 'Drip', 'Canal', 'Well/Borewell', 'Sprinkler', 'Other'],
            default: 'Rainfed',
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
    },
    { timestamps: true }
);

farmSchema.index({ farmer: 1 });

module.exports = mongoose.model('Farm', farmSchema);
