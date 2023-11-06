const asyncHandler = require("express-async-handler");
const { Chat, validateChat } = require("../models/chat_model");
const { User } = require("../models/user_model");

//@desc initiate chat
//@route /api/chat/initiate
//@access PRIVATE
const initiateChat = asyncHandler(async (req, res) => {
  const { error } = validateChat(req.body);

  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const initiator = req.user;
  const user = req.body.user;

  //check if receiver is valid
  const receiver = User.findById({_id: user});
  if(!receiver){
    res.status(400);
    throw new Error('Receiver does not exist');
  }

  // check if receiver is not the user who is requesting a chat
  if (receiver._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot chat with yourself");
  }

  try {
    //trying to avoid duplicate chat
    const availableChat = await Chat.findOne({
        user: user,
        initiator: initiator.id,
    });

    if (availableChat) {
      res.status(200).json({
        isNew: false,
        message: "Retrieving an old chat room",
        chat_room_id: availableChat._id,
      });
    } else {
      const newChat = new Chat({
        user,
        initiator: initiator.id,
      });
      await newChat.save();
      if (newChat) {
        res.status(200).json({
          isNew: true,
          message: "Created a new chat room",
          chat_room_id: newChat._id,
        });
      } else {
        res.status(400);
        throw new Error("Failed to create chat");
      }
    }
  } catch (err) {
    res.status(400);
    throw new Error(err);
  }
});


//@desc retrieve conversation by roomId
//@route /api/chats/:id
//@access PRIVATE
const getChats = asyncHandler( async (req, res) =>{
    const page = req.query.page;
    const limit = req.query.size;
    const startIndex = (page - 1) * limit;

   // const chatId = req.params.id;
    // const chatRoom = await Chat.findById(chatId);
    // if(!chatRoom){
    //     res.status(400);
    //     throw new Error('Failed to connect to chat');
    // }
  

    //This query will retrieve all the chats where either the initiator or user field matches the req.user._id.
    const chats = await Chat.find({
      $or: [
        { initiator: req.user._id },
        { user: req.user._id }
    ]
    })
    .skip(startIndex)
    .limit(limit)
    .populate({path: 'user', select: '-password -tokens'})
    .sort({createdAt: -1});
    if(chats){
        res.set('total-count',chats.length);
        res.status(200).json(chats);
    }else{
        res.status(400);
        throw Error('Failed to retrieve chats');
    }
});

module.exports = {
  initiateChat,
  getChats
};
