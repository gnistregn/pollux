var Http = require('./http');
var Sound = require('./sound');

var Knapp = require('./knapp');
var Castor = require('./castor');
var TicketCounter = require('./ticketcounter');


var mode;
var self = this;



console.log('\r\n\r\n');
console.log('__________________  .____    .____     ____ _______  ___         '.blue);
console.log('\\______   \\_____  \\ |    |   |    |   |    |   \\   \\/  /    '.blue);
console.log(' |     ___//   |   \\|    |   |    |   |    |   /\\     /        '.blue);
console.log(' |    |   /    |    \\    |___|    |___|    |  / /     \\        '.blue);
console.log(' |____|   \\_________/_______ \\_______ \\______/ /___/\\  \\    '.blue);
console.log('                            \\/       \\/              \\_/     '.blue);
console.log('                        P O L L U X                              '.blue);
console.log('\n\n');


var http = new Http(); // Send our list of public modules to the http admin server








/*var castor = new Castor();
var knapp = new Knapp(castor);
var tickets = new TicketCounter();

var publicVariables = {
	warnLimit: 60
}

this.publicVariables = publicVariables;


var publicModules = {
	"main": self,
	"ticketscounter": tickets
}


var http = new Http(publicModules); // Send our list of public modules to the http admin server


var resetCount = 0;
	


castor.connect();
*/
// Pass by reference experiment
/*Object.keys(publicModules).forEach (function (moduleKey){
	console.log("\nPUBLIC MODULE: " + moduleKey);
	Object.keys(publicModules[moduleKey].publicVariables).forEach (function (paramKey){
		console.log("	- item: " + paramKey + " (" + typeof publicModules[moduleKey].publicVariables[paramKey] + ")" );//+ "\n\t\tvalue: " + publicModules[moduleKey].publicVariables[paramKey]);

	});
});
console.log('\n');

tickets.poop();
*/	
	
	
	


//process.stdout.write("\u001b[36m");
process.stdin.resume();
process.stdin.setEncoding('ascii');


// Listen for console commands
process.stdin.on('data', function (chunk) {

	// Console Command
	if (chunk.charAt(0) == '/') {
		
		// Split incoming data into command + parameter
		var n = chunk.substring(1, chunk.length - 1).split(' ');
		command = n[0].trim();
		param = n[1];
		
		// So, what should we do?
		switch (command) {
		
			// load + mode name as param
			case 'load':
				if (param != undefined) {
					mode = require('./' + param);
				} else {
					console.log('\u001b[31mMalformed command\u001b[0m');
				}
				
				break;
			
			// stop mode
			case 'stop':
				mode.stop();
				break;
				
			// start mode
			case 'start':
				mode.start();
				break;
			
			
			/*case 'tickets':
				if (param != undefined) {
					tickets.setTickets(param);
					console.log('\u001b[32mOk!\u001b[0m');
				} else {
					console.log('\u001b[31mMalformed command\u001b[0m');
				}
				break;
				
			
			case 'warn':
				if (param != undefined) {
					tickets.setWarnLimit(param);
					console.log('\u001b[32mOk!\u001b[0m');
				} else {
					console.log('\u001b[31mMalformed command\u001b[0m');
				}
				break;
			
			case 'start':
				tickets.start();
				break;
			
			case 'reset':
				if (param == undefined) {
					tickets.reset();
					knapp.reset();
					console.log('\u001b[32mOk!\u001b[0m');
				} else {
					console.log('\u001b[31mMalformed command\u001b[0m');
				}
				break;
			
			*/
			
			// Quit
			case 'exit':
				end();
				break;
			
			// Quit
			case 'quit':
				end();
				break;
			
			// What you say?
			default:
				console.log('\u001b[33mUnknown command\u001b[0m');
				break;
				
			
		}

	
		
	}
	
});





// If ctrl+c is pressed
process.on('SIGINT', function () {
	end();
});






// Quit out of this madness
function end () {
	console.log("\u001b[35mByebye!\u001b[0m");
	process.exit();
}






/* -------------------- GAME MODE SETUP -------------------- */


// HTTP
/*
http.on('update', function (command, param) {
	console.log('HTTP Command > ' + command + ': ' + param);
	if (command == 'tickets') tickets.setTickets(param);
	if (command == 'warn') tickets.setWarnLimit(param);
	if (command == 'reset') tickets.reset();
});





// CASTOR

castor.on('io', function (samples, source) {
	if (source == "013a20407940d8") knapp.updateButtons(samples[0]);
});




// KNAPP

knapp.on('pressed', function (button) {
	console.log("Button " + button + " pressed.");
	tickets.start();
	if (button == 3) {
		tickets.toggle(1);
		knapp.light(0, false);
		knapp.light(1, false);
		knapp.light(2, true);
		Sound.play("blue_team_has_captured_the_base");
	}
	
	if (button == 4) {
		tickets.toggle(0);
		knapp.light(0, true);
		knapp.light(1, false);
		knapp.light(2, false);
		Sound.play("red_team_has_captured_the_base");
	}
	
	
	if (button == 5) {

		resetCount++;
		if (resetCount == 5) {
			Sound.play("game_has_been_reset");
			resetCount = 0;
			knapp.light(0, false);
			knapp.light(1, false);
			knapp.light(2, false);
			tickets.reset();
		}
		
	}
	

});


knapp.on('released', function (button) {
	console.log("Button " + button + " released.");
});




// TICKETCOUNTER

tickets.on('started', function () {
	console.log('Ticket counter started');
});


tickets.on('ended', function (side) {
	knapp.light(0, false);
	knapp.light(1, false);
	knapp.light(2, false);
	
	console.log('Match ended! ' + side + ' lost.');
	if (side == 0) {
		Sound.play(["game_over","blue_team", "lost", "please_try_again"]);
	} else {
		Sound.play(["game_over","red_team", "lost", "please_try_again"]);
	}
});


tickets.on('toggled', function (side) {
	console.log('Toggled to team ' + side);
});

tickets.on('update', function (time) {
	console.log("Team A: " + time[0] + " Team B: " + time[1]);
	if (time[0] == publicVariables.warnLimit) console.log(publicVariables.warnLimit + " secs left for team 0");
	if (time[1] == publicVariables.warnLimit) console.log(publicVariables.warnLimit + " secs left for team 1");
});
*/
/*
tickets.on('warn', function (side, time) {
	console.log('Warning! Team ' + side + ' has ' + time + ' seconds remaining!!');
	if (side == 0) {
		Sound.play(["blue_team","you_have_one_minute_remaining"]);
	} else {
		Sound.play(["red_team","you_have_one_minute_remaining"]);
	}
});

*/






