const express = require('express');
const http = require('http'); // Import the HTTP module
const { connectToDatabase } = require('./backend/config/conn.js');
const { errorHandler } = require('./backend/middleware/error_middleware.js');
const users = require('./backend/routes/users');
const services = require('./backend/routes/services');
const categories = require('./backend/routes/categories');
const bookings = require('./backend/routes/bookings');
const reviews = require('./backend/routes/reviews');
const favorites = require('./backend/routes/favorites');
const chats = require('./backend/routes/chats');
const socketIo = require('socket.io'); // Import the Socket.io library

const app = express();

connectToDatabase();

app.use(express.json({ limit: '2mb' }));

app.use('/api/users', users);
app.use('/api/services', services);
app.use('/api/categories', categories);
app.use('/api/bookings', bookings);
app.use('/api/reviews', reviews);
app.use('/api/favorites', favorites);
app.use('/api/chats', chats);

const port = process.env.PORT || 3001;

app.use(errorHandler);

const server = http.createServer(app); // Create an HTTP server using Express app
const io = socketIo(server); // Attach Socket.io to the server

//users in the connections
let activeUsers = [];

io.on('connection', (socket) => {
  console.log('A user connected to the socket');

  // Implement your socket.io event handling here
  socket.on('new-user-add', (newUserId) => {
   
    // You can broadcast data to other connected clients here
    if(!activeUsers.some((user) => user.userId == newUserId)){
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      })
    }
    
    console.log('Connected Users',activeUsers);
    io.emit('get-users', activeUsers);
  });

  socket.on('disconnect', () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log('User Disconnected', activeUsers);
    io.emit('get-users',activeUsers);
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log(`http://localhost:${port}`);
});
