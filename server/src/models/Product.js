const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        category: {
            type: String,
            enum: ['pesticide', 'fertilizer', 'fungicide', 'heribicide'],
            required: [true, 'Category is required'],
        },
        licenseNumber: {
            type: String,
            required: [true, 'CIB&RC registration number is required'],
            unique: true,
            trim: true,
        },
        activeIngredient: {
            type: String,
            trim: true,
        },
        manufacturer: {
            type: String,
            trim: true,
        },
        cropTypes: {
            type: [String], //e.g.- ['sugarcan','cotton','wheat']
            default: [],
        },
        isBanned: {
            type: Boolean,
            default: false,
        },
        registrationExpiry: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Product' , productSchema) ;