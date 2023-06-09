const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    service :{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Service',
        require: true,
    },
    user : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        require: true,
    },
    user_id: String
});


module.exports = favoriteSchema;