const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name : String,
  last_name : String,
  email : String, 
  password : String,
  phone : String, 
  address : String, 
  status : String,
  tokens : [{type : Object}],
  image : {type: String,},
  gender : String,
  job_title : String,
  job_description: String,
  is_agent: Boolean,
  company: String,
  device_token : String,
  skills : [{type: String}],
  

},{
  timestamps: true
});



module.exports.userSchema = userSchema;