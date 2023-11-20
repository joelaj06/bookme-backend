const mongoose = require("mongoose");
const Joi = require("joi");
const { userSchema } = require("../schemas/user_schema.js");

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    first_name: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required(),
    email: Joi.string().min(5).max(50).required().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
    confirmPassword: Joi.ref("password"),
    gender : Joi.string(),
    phone: Joi.string().min(10).max(15).required(),
    is_agent : Joi.boolean(),
    address: Joi.string().min(5).max(50).required(),
    job_title: Joi.string().allow(null,''),
    image : Joi.string().allow(null,''),
    status : Joi.string().allow(null),
    job_description : Joi.string().allow(null,''),
    skills : Joi.array().allow(null),
    company: Joi.string().allow(null,''),
  
  });

  const validate = schema.validate(user);
  console.log(validate);
  return validate;
}

function validateUserLogins(userLogins) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(50).required().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });

  const validate = schema.validate(userLogins);
  console.log(validate);
  return validate;
}

module.exports = {
  User,
  validateUser,
  validateUserLogins,
};
