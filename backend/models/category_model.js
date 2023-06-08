const mongoose = require('mongoose');
const categorySchema = require('../schemas/category_schema');

const Category =  mongoose.model('Category',categorySchema);

module.exports = Category;