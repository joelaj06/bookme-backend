const mongoose = require('mongoose');
const chatSchema = require('../schemas/chat_schema');
const Joi = require('joi');


const Chat = mongoose.model('Chat', chatSchema);

function validateChat(chat) {
    const schema = Joi.object({
      user: Joi.string().required(), 
    });
  
    const validate = schema.validate(chat);
    console.log(validate);
    return validate;
  }

module.exports = {validateChat, Chat};