const mongoose = require("mongoose");

const discount = new mongoose.Schema({
    type: String,
    value: Number,
    end_date: String,
    start_date: String,
  });

const serviceSchema = new mongoose.Schema(
  {
    title: {type: String, required: true},
    user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    description: {type: String, required: true},
    location: {type: String, required: true},
    cover_image:  {data: Buffer,
      contentType: String},
    is_special_offer: {type: Boolean, default: false},
    images: [{ type: Buffer }],
    categories: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Category" }],
    price: Number,
    discount: discount,
  },
  {
    timestamps: true,
  }
);



module.exports.serviceSchema = serviceSchema;
