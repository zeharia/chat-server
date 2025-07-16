const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://react-chat-eta-seven.vercel.app/",
    methods: ["GET", "POST"],
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join-user", (username) => {
    users[socket.id] = username;
    console.log(`${username} connected`);
  });

  socket.on("join-private-room", ({ room }) => {
    socket.join(room);
    console.log(`${username} join the room ${room}`);
  });

  socket.on("private-message", ({ room, message }) => {
    const username = users[socket.id];
    console.log(`Message from ${username} in ${room}: ${message}`);

    io.to(room).emit("receive_private_message", {
      message,
      username,
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });
});
server.listen(3001, () => {
  console.log("Chat server is running on port 3001");
});
