const { Client } = require('ssh2');
const { Server } = require('socket.io');
module.exports = function (server) {
	const io = new Server(server);

	let connectionCount = 0;
	io.on('connection', (socket) => {
		let connected = false;
		function emitError(err) {
			socket.emit('SSHError', err);
		}
		socket.on('loginAttempt', (details) => {
			//This code handles/verifies socket login attempts and establishes ssh connections.

			if (connected) return; //If user is already connected, keep them from making a new connection.

			function emitStatus(msg) {
				socket.emit('SSHStatus', msg);
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
					socket.emit('connectionStatus', true);
					console.log(
						`Client connected. Current connections: ${connectionCount}`
					);
					conn.shell(
						{ cols: details.cols, rows: details.rows },
						(err, stream) => {
							if (err) console.log('CONN ERR :' + err);
							stream
								.on('close', () => {
									//conn.end();
									connectionCount--;
									connected = false;
									socket.emit('connectionStatus', false);
									socket.emit('SSHStatus', 'Not connected');
									console.log(
										'Client disconnected. ' + connectionCount > 1
											? `Current connections: ${connectionCount}`
											: 'No clients connected.'
									);
								})

								.on('data', (data) => {
									socket.emit('data', data.toString());
								})
								.on('error', (e) => console.error(e));

							socket.on('data', (e) => {
								if (!connected) return;
								try {
									stream.write(e.toString());
								} catch (error) {
									console.log(error);
								}
							});
							socket.on('disconnect', () => {
								stream.end('exit\n');
								connected = false;
							});
						}
					);
				})
				.on('error', (e) => {
					emitError(e);
				})
				.connect({
					host: details.host,
					port: details.port === '' ? 22 : details.port,
					username: details.username,
					password: details.password,
				});
		});
	});
};
