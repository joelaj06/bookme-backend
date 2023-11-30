const mongoose = require("mongoose");
const Joi = require("joi");
const bookingSchema = require("../schemas/booking_schema");

const Booking = mongoose.model("Booking", bookingSchema);

function validateBooking(booking) {
  const schema = Joi.object({
    user: Joi.string().min(1).max(50).required(),
    agent: Joi.string().min(1).max(50).required(),
    service: Joi.string().min(5).max(50).required(),
    agent_id: Joi.string().min(1).max(50).required(),
    user_id: Joi.string().min(5).max(50).required(),
    location: Joi.string().required(),
    start_date: Joi.string(),
    end_date: Joi.string().required(),
    preliminary_cost: Joi.number(),
    status: Joi.string().required(),
    fcm_notification: Joi.object(),
    notes: Joi.string().required().allow("", null),
  });

  const validate = schema.validate(booking);
  console.log(validate);
  return validate;
}

module.exports = {
  Booking,
  validateBooking,
};
