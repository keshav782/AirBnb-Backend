const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    
    place:{
        type:mongoose.Types.ObjectId,
        ref:"Place",
        required:true
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    checkin:{
        type:String,
        required:true
    },
    checkout:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    number:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
});
const BookingModel = mongoose.model("Booking", bookingSchema);
module.exports = BookingModel;
