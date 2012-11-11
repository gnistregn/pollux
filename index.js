var Http = require('./http');
var Sound = require('./sound');

var Knapp = require('./knapp');
var Castor = require('./castor');
var TicketCounter = require('./ticketcounter');



console.log('\r\n\r\n');
console.log('Welcome to POLLUX');
console.log('-----------------');


var castor = new Castor();
var knapp = new Knapp(castor);
var tickets = new TicketCounter();



var http = new Http();









//process.stdout.write("\u001b[36m");





process.stdin.resume();
process.stdin.setEncoding('ascii');

process.stdin.on('data', function (chunk) {

	// Console Command
	if (chunk.charAt(0) == '/') {
		
		
		var n = chunk.substring(1, chunk.length - 1).split(' ');
		command = n[0].trim();
		param = n[1];
		
		
			
	
		
		switch (command) {
		
			
			case 'tickets':
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
			
			
			case 'reset':
				if (param == undefined) {
					tickets.reset();
					knapp.reset();
					console.log('\u001b[32mOk!\u001b[0m');
				} else {
					console.log('\u001b[31mMalformed command\u001b[0m');
				}
				break;
			
			
			case 'exit':
				end();
				break;
			
			
			case 'quit':
				end();
				break;
			
			
			default:
				console.log('\u001b[33mUnknown command\u001b[0m');
				break;
				
			
		}

	
		
	// Serial Data	
	} else {
		
		
		//castor.process(chunk);
		
		
	}
	
});







process.on('SIGINT', function () {
	end();
});







function end () {
	console.log("\u001b[35mByebye!\u001b[0m");
	process.exit();
}






/* -------------------- GAME MODE SETUP -------------------- */


// HTTP

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

/*
castor.on('voltage', function (msg) {
	console.log('Voltage received: ' + msg);
});
*/



// KNAPP

knapp.on('pressed', function (button) {
	console.log("Button " + button + " pressed.");
//	tickets.start();
	if (button == 3) {
//		tickets.toggle(0);
		knapp.light(0, true);
		knapp.light(1, false);
		knapp.light(2, false);
//		Sound.play("1");
	}
	if (button == 5) {
//		tickets.toggle(1);
		knapp.light(0, false);
		knapp.light(1, true);
		knapp.light(2, false);
//		Sound.play("2");
	}
	
	if (button == 4) {
		knapp.light(0, false);
		knapp.light(1, false);
		knapp.light(2, true);
//		knapp.light(4);
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
	console.log('Match ended! ' + side + ' lost.');
});


tickets.on('toggled', function (side) {
	console.log('Toggled to team ' + side);
});

tickets.on('update', function (time) {
	console.log("Team A: " + time[0] + " Team B: " + time[1]);
});


tickets.on('warn', function (side, time) {
	console.log('Warning! Team ' + side + ' has ' + time + ' seconds remaining.');
});








