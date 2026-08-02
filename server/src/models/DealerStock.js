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


    },
    {
        timestamps: true
    }
);


// A dealer shouldn't have two separate stock entries for the same product
dealerStockSchema.index({ dealer: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('DealerStock', dealerStockSchema);