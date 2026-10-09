const mongoose = require('mongoose');
const dealerStockSchema = new mongoose.Schema(
    {
        dealer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dealer',
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantityAvailable: {
            type: Number,
            required: [true, 'Quantity avaiable is required'],
            min: 0,
        },
        unit: {
            type: String,
            enum: ['liters', 'kg', 'packets'],
            default: 'liters',
        },
        price: {
            type: Number,
            min: [0, 'Price cannot be negative'],
            max: [1000000, 'Price cannot exceed 1,000,000'],
            default: null,
        },
        priceUpdatedAt: {
            type: Date,
            default: null,
        },
        minimumStockThreshold: {
            type: Number,
            min: [0, 'Threshold cannot be negative'],
            default: 10,
        },


    },
    {
        timestamps: true
    }
);


// A dealer shouldn't have two separate stock entries for the same product
dealerStockSchema.index({ dealer: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('DealerStock', dealerStockSchema);