const mongoose = require('mongoose') ;

const usageLogSchema = new mongoose.Schema({
    date : {
        type : Date , 
        default : Date.now,
    },
    quantityUsed : {
        type : Number , 
        required : true , 
    },
    cropApplied:{
        type : String ,
        trim : true 
    },
    notes :{
        type: String , 
        trim : true ,
    },


} , {_id : true});

const farmerInventorySchema = new mongoose.Schema({
    farmer:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true ,
    },
    product:{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'Product',
        required : true ,
    },
    quantityPurchased : {
        type : Number ,
        required : [true , 'Quantity purchased is required'],
        min : 0 ,
    },
    quantityRemaining:{
        type : Number ,
        required : true ,
        min : 0 ,
    },
    unit: {
      type: String,
      enum: ['liters', 'kg', 'packets'],
      default: 'liters',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchasedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dealer',
    },
    usageLog: [usageLogSchema],
} , { timestamps : true}) ;

module.exports = mongoose.model('FarmerInventory' , farmerInventorySchema) ;
