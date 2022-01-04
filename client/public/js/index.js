'use strict';

//DOM props
const button = document.getElementById('buttonconnect');
const hostVal = document.getElementById('hostinput');
const portVal = document.getElementById('portinput');
const userVal = document.getElementById('userinput');
const passVal = document.getElementById('passinput');
const inputs = document.querySelectorAll('input');
const logindiv = document.getElementById('login-div');
const statusmsg = document.getElementById('statusmsg');
const statusdiv = document.getElementById('statusdiv');
let connected = false;

const socket = io();
socket.on('connect', () => checkInputs());
const terminalContainer = document.getElementById('terminal-container');
const term = new Terminal({
	theme: { background: '#080808' },
});
const fitAddon = new FitAddon();
term.open(terminalContainer);
term.loadAddon(fitAddon);
fitAddon.fit();

onresize = () => fitAddon.fit();

term.onData((e) => {
	socket.emit('data', e);
});

addEventListener('keydown', checkInputs);
onclick = checkInputs;

button.onclick = () => {
	if (!checkInputs()) return;
	socket.emit('loginAttempt', {
		host: hostVal.value,
		port: portVal.value,
		username: userVal.value,
		password: passVal.value,
		cols: term.cols,
		rows: term.rows,
	});
};

socket
	.on('data', (data) => {
		term.write(data);
	})
	.on('connected', (state) => (connected = state))
	.on('SSHStatus', (e) => {
		statusdiv.style.backgroundColor = e.color;
		if (e.err) {
			if (connected) return;
			e.body = JSON.parse(e.body);
			switch (e.body.level) {
				case 'client-timeout':
					return;
				case 'client-authentication':
					term.write('Password or username incorrect. Please try again.\n');
					return (statusmsg.textContent = 'Authentication failure');
				case 'client-socket':
					term.write('Invalid host.\n');
					statusmsg.textContent = 'Invalid host';
					return;
				default:
					term.writeln(
						`ERROR: ${
							e.body.code ?? e.body.level
						}. Error details dumped to console.`
					);
					statusmsg.textContent = e.body.code ?? e.body.level;
					console.error(e.body);
					break;
			}
		} else {
			statusmsg.textContent = e.body;
			document.title = e.body;
			if (connected || e.body.includes('Connected to')) {
				logindiv.style.display = 'none';
			} else {
				logindiv.style.display = 'block';
				term.rows = 20;
			}
		}
	});

function checkInputs() {
	button.disabled =
		hostVal.value == '' || userVal.value == '' || passVal.value == '';
	return !button.disabled;
}
