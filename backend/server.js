require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ server });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize the Schema
const messageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// To store the connected clients
const clients = new Map();


wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    message: 'Connected to chat server. Please send your username.'
  }));

  // Handle messages from the clients
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'SET_USERNAME') {
        clients.set(ws, data.username);
        console.log(`User connected: ${data.username}`);
        
        // Send the last 50 messages to the newly connected client
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50).sort({ timestamp: 1 });
        
        ws.send(JSON.stringify({
          type: 'MESSAGE_HISTORY',
          messages: messages
        }));
        
        // Notify all clients about the new user entering the chat
        broadcast({
          type: 'USER_JOINED',
          username: data.username,
          timestamp: new Date()
        });
      } 
      else if (data.type === 'SEND_MESSAGE') {
        const username = clients.get(ws);
        if (!username) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Please set a username first'
          }));
          return;
        }
        
        // save messages to the mongod database
        const message = new Message({
          username,
          message: data.message,
          timestamp: new Date()
        });
        
        await message.save();
        
        broadcast({
          type: 'NEW_MESSAGE',
          username,
          message: data.message,
          timestamp: message.timestamp
        });
      }
    } 
    catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Error processing your request'
      }));
    }
  });

  // client disconnection
  ws.on('close', () => {
    const username = clients.get(ws);
    if (username) {
      console.log(`User disconnected: ${username}`);
      clients.delete(ws);
      
      // Notify all clients about user leaving the chat
      broadcast({
        type: 'USER_LEFT',
        username,
        timestamp: new Date()
      });
    }
  });
});


// function to broadcast messages to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await mongoose.connection.close();
  
  server.close(() => {
    console.log('Server has been shut down');
    process.exit(0);
  });
});
