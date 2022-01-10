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

logindiv.addEventListener('keyup', (e) => {
	if (e.code != 'Enter') return;
	tryLogin();
});

addEventListener('keydown', checkInputs);
onclick = checkInputs;

button.onclick = tryLogin;

socket
	.on('data', (data) => {
		term.write(data);
	})
	.on('connectionStatus', (state) => {
		connected = state;
		statusdiv.style.backgroundColor = state ? 'green' : 'grey';
		logindiv.style.display = state ? 'none' : 'block';
	})
	.on('SSHError', (e) => {
		{
			try {
				e = JSON.parse(e);
			} catch (e) {}

			statusdiv.style.backgroundColor = 'red';

			switch (e.level) {
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
						`ERROR: ${e.code ?? e.level ?? e}. Error details dumped to console.`
					);
					statusmsg.textContent = e.code ?? e.level ?? 'you stinker';
					console.log(e);
					break;
			}
		}
	})
	.on('SSHStatus', (e) => {
		statusmsg.textContent = e;
		document.title = e;
	});

function checkInputs() {
	button.disabled = hostVal.value == '' || userVal.value == '';
	return button.disabled;
}

function tryLogin() {
	if (checkInputs()) return;
	socket.emit('loginAttempt', {
		host: hostVal.value,
		port: portVal.value,
		username: userVal.value,
		password: passVal.value,
		cols: term.cols,
		rows: term.rows,
	});
}
