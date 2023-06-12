const mongoose = require('mongoose');
const messageSchema = require('../schemas/message_schema');

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;