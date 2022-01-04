require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const path = require('path');
const port = parseInt(process.argv.slice(2, 3)) || process.env.PORT || 8080;

const appSocket = require('./socket');
const favicon = require('serve-favicon');

app.use(express.static(path.join(__dirname, '../client/public')));
app.use(favicon(path.join(__dirname, '../client', 'public', 'favicon.ico')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/index.html'));
});

appSocket(server);

server.listen(port, () => console.log('live on http://localhost:' + port));
