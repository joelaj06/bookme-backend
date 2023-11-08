const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    initiator: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
    last_message : String
  },
  {
    timestamps: true,
  }
);

module.exports = chatSchema;