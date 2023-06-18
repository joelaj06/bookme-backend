const dotenv = require('dotenv').config({path:'./.env'});
require('dotenv').config({ path: '../.env' });

const mongodb = require('mongodb');
const mongoose = require('mongoose');


const connectToDatabase = async () => {
    try{
        console.log('Connecting to database...');
        const conn = await mongoose.connect(process.env.ATLAS_URI , {useNewUrlParser : true});
        console.log(`Connected to Database ${conn.connection.host}`);
    }catch(err){
        console.log(err);
        process.exit();
    }
}


module.exports = {connectToDatabase}

