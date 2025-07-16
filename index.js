const express=require ('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('send_message', (message) => {
        console.log('Message received:', message);
        io.emit('receive_message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
server.listen(3001, () => {
    console.log('Chat server is running on port 3001');
});

