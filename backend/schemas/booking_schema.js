const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },  
    agent: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    service: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Service'
    },
    start_date: String,
    end_date: String,
    location: String,
    preliminary_cost: Number,
    notes: String,
    status: String,
});

module.exports = bookingSchema;