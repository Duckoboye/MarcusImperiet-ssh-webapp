require('dotenv').config();
const { readFileSync } = require('fs');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const path = require('path');
const port = parseInt(process.argv.slice(2, 3)) || process.env.PORT || 8080;

const appSocket = require('./socket');

app.use(express.static(path.join(__dirname, '../client/public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/index.html'));
});
try {
	appSocket(server);
} catch (error) {
	console.log('err from socket.js');
}

server.listen(port, () => console.log('live on http://localhost:' + port));
