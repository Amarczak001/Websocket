const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server, path: '/voting' });

let results = {
  pizza: 0,
  pasta: 0
};

app.use(express.static('client'));

// Set to store connected clients
const clients = new Set();

wsServer.on('listening', () => {
  console.log('WebSocket server is listening on port 3000');
});

wsServer.on('connection', (socket) => {
  console.log('Client connected!');

  // Add client to the set
  clients.add(socket);

  socket.on('message', (message) => {
    console.log('Message received: ' + message);

    // Handle vote
    const data = JSON.parse(message);
    const vote = data.vote;

    if (vote === 'pizza') {
      results.pizza++;
    } else if (vote === 'pasta') {
      results.pasta++;
    }

    // Send current results to all clients
    const resultsMessage = JSON.stringify({ results });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(resultsMessage);
      }
    });
  });

  socket.on('close', () => {
    // Remove client from the set
    clients.delete(socket);
    console.log('Client disconnected, total number of clients is: ', clients.size);
  });

  socket.on('error', (error) => {
    console.log('Error: ' + error);
  });

  // Send current results to a newly connected client
  const resultsMessage = JSON.stringify({ results });
  socket.send(resultsMessage);

  console.log('Sending to a newly connected client.');
});

wsServer.on('error', (error) => {
  console.log('WebSocket server error: ' + error);
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
