const express = require('express');
const {connectToDatabase} = require('./backend/config/conn.js');
const {errorHandler }= require('./backend/middleware/error_middleware.js');
const users = require('./backend/routes/users');


const app = express();

connectToDatabase();


app.use(express.json());

app.use('/api/users', users);

const port = process.env.PORT || 3001;

app.use(errorHandler);

app.listen(port, () =>{
    console.log(`Sever started on port ${port}`);
    console.log(`http://localhost:${port}`);
})



