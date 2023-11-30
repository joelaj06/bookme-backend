const asyncHandler = require('express-async-handler');
const Message = require('../models/message_model');
const { Chat } = require('../models/chat_model');
const { User } = require('../models/user_model');
const { sendPushNotification } = require('./push_notification_controller');

//@desc create message in chat
//@route /api/:chatId/message
//@access PRIVATE
const postMessage = asyncHandler(async(req, res)=>{

    const sender = req.user;
    const {id:chatId} = req.params;
    const {recipient, message,
        fcm_notification} = req.body;


    const receiver = await User.findById(recipient);
    const chatRoom = await Chat.findById(chatId);
    if(!chatRoom){
        res.status(400);
        throw new Error('Failed to connect to chat');
    }

    if(receiver.device_token){
        const notification = {
          title: 'New message',
          body: `You have a new message from ${sender.first_name} ${sender.last_name}`
        }
        const data = {
          route : fcm_notification.route,
        }
        const payload = {
          notification,
          data,
          token: receiver.device_token,
        } 
         sendPushNotification(payload);
      }

    const currentLoggedInUser = req.user;

    const newMessage = new Message({
        sender : currentLoggedInUser.id,
        recipient: recipient,
        content: message,
        chat: chatId,
    });
    
    await newMessage.save();
    if(newMessage){
        const message = await Message.findById(newMessage._id).populate({path: 'sender', select: '-password -tokens'})
        .populate({path: 'recipient', select: '-password -tokens'});
         await Chat.findByIdAndUpdate(chatId, {
          last_message: message.content.message_text,
       }); 
        res.status(200).json(message);
    }else{
        res.status(400);
        throw new Error('Failed to create message');
    }

});


//@desc retrieve all chat messages
//@routes /api/chats/:id/messages
//@access PRIVATE
const getMessages = asyncHandler( async (req, res) =>{
    const page = req.query.page;
    const limit = req.query.size;
    const startIndex = (page - 1) * limit;

    const chatId = req.params.id;
    const chatRoom = await Chat.findById(chatId);

    if(!chatRoom){
        res.status(400);
        throw new Error('Failed to connect to chat');
    }

    const messages = await Message.find({
        chat : chatId
    })
    .populate({path: 'sender', select: '-password -tokens'})
    .populate({path: 'recipient', select: '-password -tokens'})
    .sort({createdAt: -1})
    .limit(limit)
    .skip(startIndex);

    if(messages){
        res.set('total-count', messages.length);
        res.status(200).json(messages);
    }else{
        res.status(400);
        throw new Error('Failed to retrieve chats');
    }
})


module.exports = {
    postMessage,
    getMessages,
}