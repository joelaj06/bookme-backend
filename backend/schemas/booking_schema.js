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
    user_id:String, 
    agent_id:String,
    start_date: String,
    end_date: String,
    location: String,
    preliminary_cost: Number,
    notes: String,
    status: String,
},{
    timestamps: true,
});

module.exports = bookingSchema;