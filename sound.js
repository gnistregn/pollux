var exec = require("child_process").exec;
var queueOffset = 0;

function playIncoming (n) {
	if (n instanceof Array) {
		queueOffset = 0;
		queue(n);
	}
	if (n instanceof String) {
		play(n);
	}
	play(n, null);
}

function play (n) {
	exec("afplay sounds/" + n + ".wav", function (error, stdout, stderr) {
	});	
}

function queue (n) {
	exec("afplay sounds/" + n[queueOffset] + ".wav", function (error, stdout, stderr) {
		queueOffset++;
		if (queueOffset < n.length) queue(n);	
	});
	
}

exports.play = playIncoming;