const dotenv = require("dotenv").config({ path: "./.env" });
require("dotenv").config({ path: "../.env" });
const cloudinaryModual = require("cloudinary");

const cloudinary = cloudinaryModual.v2;

const configCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRETE,
    });
  } catch (error) {
    console.log(error);
  }
};

const uploadImage = async (base64String) =>{
  const uploadStr = 'data:image/jpeg;base64,'+base64String;
       imageRes = await cloudinary.uploader.upload(uploadStr,{
        upload_preset : 'bookme'
      });
      return imageRes.secure_url;
}

module.exports = { uploadImage, configCloudinary };
