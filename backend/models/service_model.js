const mongoose = require('mongoose');
const {serviceSchema} = require('../schemas/services_schema');

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service