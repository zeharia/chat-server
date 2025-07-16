const express = require('express');
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

// Stocker les utilisateurs connectés et les rooms actives
const connectedUsers = new Map(); // socketId -> username
const activeRooms = new Set(); // Liste des rooms actives

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Quand un utilisateur rejoint avec son nom
    socket.on('join_user', (username) => {
        console.log(`User ${username} joined with socket ${socket.id}`);
        
        // Stocker l'utilisateur
        connectedUsers.set(socket.id, username);
        socket.username = username;
        
        // Envoyer la liste des utilisateurs connectés à tous
        const usersList = Array.from(connectedUsers.values());
        io.emit('users_list', usersList);
        
        // Envoyer la liste des rooms actives
        io.emit('active_rooms_list', Array.from(activeRooms));
    });

    // Rejoindre une room privée
    socket.on('join_private_room', (data) => {
        const { room } = data;
        console.log(`User ${socket.username} joining room: ${room}`);
        
        // Rejoindre la room
        socket.join(room);
        
        // Ajouter la room à la liste des rooms actives
        activeRooms.add(room);
        
        // Notifier que l'utilisateur a rejoint la room
        socket.emit('room_joined', room);
        
        // Envoyer la liste mise à jour des rooms actives
        io.emit('active_rooms_list', Array.from(activeRooms));
    });

    // Gérer les messages privés
    socket.on('private_message', (data) => {
        const { room, message } = data;
        const username = socket.username;
        
        console.log(`Message from ${username} in room ${room}: ${message}`);
        
        // Envoyer le message à tous les utilisateurs de la room
        io.to(room).emit('receive_private_message', {
            username,
            message,
            room,
            timestamp: new Date().toISOString()
        });
    });

    // Gérer les messages globaux (si nécessaire)
    socket.on('send_message', (message) => {
        console.log('Global message received:', message);
        io.emit('receive_message', message);
    });

    // Quand un utilisateur se déconnecte
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Supprimer l'utilisateur de la liste
        if (connectedUsers.has(socket.id)) {
            const username = connectedUsers.get(socket.id);
            connectedUsers.delete(socket.id);
            
            // Envoyer la liste mise à jour des utilisateurs
            const usersList = Array.from(connectedUsers.values());
            io.emit('users_list', usersList);
            
            console.log(`User ${username} removed from connected users`);
        }
        
        // Nettoyer les rooms vides (optionnel)
        // Cette partie peut être améliorée pour supprimer les rooms vides
    });
});

server.listen(3001, () => {
    console.log('Chat server is running on port 3001');
});