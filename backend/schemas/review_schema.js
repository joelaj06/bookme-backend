const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'},
    agent : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    service: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Service'
    },
    user_id: String,
    service_id: String,
    agent_id: String,
    rating: Number,
    comment: String,
} , {
    timestamps: true,
  });

module.exports = reviewSchema;