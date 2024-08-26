require('./config/db');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('express').json;
const cookieParser = require('cookie-parser');
const cronJobs = require('./cron');
const { WebSocketServer } = require('ws');

const app = express();
const port = 3001;

app.use(cookieParser());
app.use(bodyParser());
app.use(cors());
app.use('/', require('./routes/router'));

// Create an HTTP server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Create a WebSocket server
const wss = new WebSocketServer({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    // Send a message to the client
    ws.send('Welcome to the WebSocket server!');

    // Handle messages from the client
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        // Echo the message back to the client
        ws.send(`Server received: ${message}`);
    });

    // Handle WebSocket disconnections
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});
