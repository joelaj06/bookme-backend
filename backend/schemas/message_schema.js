const mongoose = require('mongoose');


const MESSAGE_TYPES = {
    TYPE_TEXT: "text",
  };
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.SchemaTypes.ObjectId,
        ref : 'User'
    },
    recipient : {
        type: mongoose.SchemaTypes.ObjectId,
        ref : 'User'
    },
    content: mongoose.SchemaTypes.Mixed,
    type: {
        type: String,
        default: () => MESSAGE_TYPES.TYPE_TEXT,
      },
    chat: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Chat'
    },
    status: String,
},{
    timestamps: true
});

module.exports = messageSchema;