//TODO: Don't do shit here, pls

const path = require('path');

const publicPath = path.join(__dirname, '../client', 'public');
const express = require('express');

//express setup
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
/*const session = require('express-session')({
	secret: 'bababooeysecwet',
	name: 'QUACKSSH',
	resave: true,
	saveUninitialized: false,
	unset: 'destroy',
});*/

const appSocket = require('./socket');

app.disable('x-powered-by');

//static
app.use(express.static(publicPath));
//app.use(session);

app.get('/', (req, res) => {
	res.sendFile(publicPath);
});

app.use((req, res) => {
	res.status(404).send("Sorry, can't find that :(");
});

app.use((err, req, res) => {
	console.error(err.stack);
	res.status(500).send('Soemthing brokey');
});

//globals
let connectionCount = 0;
io.on('connection', (socket) => {
	socket.on('loginAttempt', () => appSocket(socket));
});

server.listen(8080, () => console.log('server live'));
