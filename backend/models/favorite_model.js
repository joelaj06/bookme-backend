const mongoose = require('mongoose');
const favoriteSchema = require('../schemas/favorite_schema');

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;