'use strict';
exports.__esModule = true;
var xterm_1 = require('xterm');
//DOM props
var button = document.getElementById('button1');
var hostVal = document.getElementById('hostinput');
var portVal = document.getElementById('portinput');
var userVal = document.getElementById('userinput');
var passVal = document.getElementById('passinput');
var terminalContainer = document.getElementById('terminal-container');
var term = new xterm_1.Terminal();

term.open(terminalContainer);
term.focus();
term.write('Host: ');
button.onclick = function () {
	var details = {
		host: hostVal.value,
		port: portVal.value,
		user: userVal.value,
		pass: passVal.value,
	};
	console.log('button pressed');
	socket.emit('connectAttempt', details);
};
socket.on('data', function (data) {
	term.write(String.fromCharCode.apply(null, new Uint8Array(data)));
});
