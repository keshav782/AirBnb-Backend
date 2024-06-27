const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    title: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    photos: {
        type: [String],
    },
    description: {
        type: String,
        required: true,
    },
    perks:{
        type:[String],
    },
    extraInfo:{
        type: String,
    },
    checkin: {
        type: Number,
    },
    checkout: {
        type: Number,
    },
    maxGuests: {
        type: Number,
    },
    price:{
        type: Number,
        required: true,
    }
});

const PlaceModel = mongoose.model("Place", placeSchema);
module.exports = PlaceModel;