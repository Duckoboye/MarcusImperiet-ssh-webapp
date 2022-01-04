const { Client } = require('ssh2');
const { Server } = require('socket.io');
module.exports = function (server) {
	const io = new Server(server);

	let connectionCount = 0;
	function emitError(err) {
		io.emit('SSHStatus', { body: err, color: 'red', err: true });
	}
	io.on('connection', (socket) => {
		let connected = false;

		socket.on('loginAttempt', (details) => {
			//This code handles/verifies socket login attempts and establishes ssh connections.

			if (connected) return; //If user is already connected, keep them from making a new connection.

			function emitStatus(msg) {
				socket.emit('SSHStatus', { body: msg, color: 'green' });
			}
			//validates neccesary inputs to make sure that they're valid. If they aren't, emit error message on socket.
			if (details.host === '')
				return emitError(
					"INVALID CREDENTIALS: Host is required. You're just trying to break the system at this point, aren't you?"
				);
			if (details.username === '' || details.username.length > 32)
				return emitError('INVALID CREDENTIALS: Username is invalid.');
			//-----
			const conn = new Client();
			conn
				.on('ready', () => {
					//Establishes and handles connections.
					connected = true;
					connectionCount++;
					emitStatus(`Connected to ${details.host}`);
					socket.emit('Connected', true);
					console.log(
						`Client connected. Current connections: ${connectionCount}`
					);
					conn.shell(
						{ cols: details.cols, rows: details.rows },
						(err, stream) => {
							if (err) console.log('CONN ERR :' + err);
							stream
								.on('close', () => {
									conn.end();
									connected = false;
									connectionCount--;
									socket.emit('Connected', false);
									socket.emit('SSHStatus', {
										body: 'Not connected',
										color: 'Grey',
									});
									console.log(
										'Client disconnected. ' + connectionCount > 1
											? `Current connections: ${connectionCount}`
											: 'No clients connected.'
									);
								})

								.on('data', (data) => {
									socket.emit('data', data.toString());
								});

							socket.on('data', (e) => stream.write(e.toString()));
							socket.on('disconnect', () => {
								stream.end('exit\n');
								connected = false;
							});
						}
					);
				})
				.connect({
					host: details.host,
					port: details.port === '' ? 22 : details.port,
					username: details.username,
					password: details.password,
				});
		});
	});
	process.on('uncaughtException', (err) => {
		if (err.code === 'ENOTFOUND' || 'EHOSTUNREACH') {
			emitError(JSON.stringify(err));
		} else throw err;
	});
};
