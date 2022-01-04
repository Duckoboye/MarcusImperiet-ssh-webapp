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

appSocket(server);

process.on('uncaughtException', (err) => {
	console.log('uncaught exception: ' + err);
	if (err.code == 'ERR_STREAM_WRITE_AFTER_END') return;
	throw err;
});

server.listen(port, () => console.log('live on http://localhost:' + port));
