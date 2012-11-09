var exec = require("child_process").exec;

function play (n) {
	exec("afplay sounds/" + n + ".wav", function (error, stdout, stderr) {
		content = stdout;
	});
}

exports.play = play;