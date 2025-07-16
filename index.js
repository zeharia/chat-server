const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://react-chat-eta-seven.vercel.app", // sans slash final !
    methods: ["GET", "POST"],
  },
});

const users = {}; // socket.id => username

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join_user", (username) => {  // CORRECTION: join_user (underscore)
    users[socket.id] = username;
    console.log(`${username} connected`);

    // Envoyer la liste des utilisateurs connectés à tous
    io.emit("users_list", Object.values(users));
  });

  socket.on("join_private_room", ({ room }) => {
    socket.join(room);
    const username = users[socket.id];
    console.log(`${username} joined the room ${room}`);

    // Envoyer à ce socket la confirmation qu’il a rejoint la room
    socket.emit("room_joined", room);

    // Optionnel: envoyer la liste des rooms actives à tous (à adapter si tu veux)
    // Ici on ne gère pas la liste globale des rooms, tu peux améliorer plus tard
  });

  socket.on("private_message", ({ room, message }) => {
    const username = users[socket.id];
    console.log(`Message from ${username} in ${room}: ${message}`);

    io.to(room).emit("receive_private_message", {
      message,
      username,
    });
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    console.log(`${username} disconnected`);
    delete users[socket.id];

    // Mettre à jour la liste des utilisateurs connectés
    io.emit("users_list", Object.values(users));
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat server is running on port ${PORT}`);
});
