const express = require('express');
const {connectToDatabase} = require('./backend/config/conn.js');
const {errorHandler }= require('./backend/middleware/error_middleware.js');
const users = require('./backend/routes/users');
const services = require('./backend/routes/services');
const categories = require('./backend/routes/categories');
const bookings = require('./backend/routes/bookings');
const reviews = require('./backend/routes/reviews');
const favorites = require('./backend/routes/favorites');
const chats = require('./backend/routes/chats');




const app = express();

connectToDatabase();


app.use(express.json({limit: '2mb'}));

app.use('/api/users', users);
app.use('/api/services', services);
app.use('/api/categories', categories);
app.use('/api/bookings', bookings);
app.use('/api/reviews', reviews);
app.use('/api/favorites', favorites);
app.use('/api/chats', chats);

const port = process.env.PORT || 3001;

app.use(errorHandler);

const server = app.listen(port, () =>{
    console.log(`Sever started on port ${port}`);
    console.log(`http://localhost:${port}`);
});


// socket
const io = require('socket.io')(server,{
    pingTimeout : 60000,
    cors: {
        origin: 'http://localhost:3000',
    }
});

io.on('connection', (socket) =>{
    console.log('connected to socket');
    socket.on('setup',(userId) =>{
        socket.join(userId);
        socket.emit('online-user', userId);
        console.log(userId);
    });

    socket.on('typing', (room) =>{
        console.log('typing');
        console.log('room');
        socket.to(room).emit('typing', room);
    });

    socket.on('stop typing', (room) =>{
        console.log('stop typing');
        console.log('room');
        socket.to(room).emit('stop typing', room);
    });

    socket.on('join chat', (room) =>{
        socket.join(room);
        console.log('User joined' + room);
    }); 


    socket.on('new message', (newMessageReceived) =>{
        var chat = newMessageReceived.chat;
        var room = chat.id;
        var sender = newMessageReceived.sender;


        if(!sender){
           console.log('User not found');
           return;
        }

        var senderId = sender.id;
        console.log(senderId + "message sender");
        socket.to(room).emit('message received', newMessageReceived);
        socket.to(room).emit('message sent', 'New Message');
    });

    socket.off('setup', () => {
        console.log('user offline');
        socket.leave(userId);
    })
})




