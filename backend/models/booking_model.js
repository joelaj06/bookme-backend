const mongoose = require('mongoose');
const bookingSchema = require('../schemas/booking_schema');

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;