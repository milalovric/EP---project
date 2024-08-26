require('./config/db');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('express').json;
const cookieParser = require('cookie-parser');
const cronJobs = require('./cron');
const http = require('http');
const socketBackend = require('./socketBack');

const app = express();
const port = 3001;

app.use(cookieParser());
app.use(bodyParser());
app.use(cors());

app.use('/', require('./routes/router'));

const server = http.createServer(app);
const io = socketBackend.init(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    // Example event to send notification
    socket.on('sendNotification', (data) => {
        io.emit('receiveNotification', data);
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});