const mongoose = require('mongoose');

const reviewSchema = require('../schemas/review_schema');

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;