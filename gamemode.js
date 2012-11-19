var Knapp = require('./knapp');
var Castor = require('./castor');
var TicketCounter = require('./ticketcounter');


var self = this;


// Whatever modules you need to make this game mode happen.
var castor = new Castor(); // Communications, check!
var knapp = new Knapp(castor); // Knapp, check!
var tickets = new TicketCounter(); // Ticket counter, check!






// Public variables go in here!
var publicVariables = {
	
	warnLimit: 60
	
}
this.publicVariables = publicVariables;


// Public modules go in here! (This makes them appear in the web interface, for example)
// The "main" module is this game mode! It's really just a self representation.
var publicModules = {
	
	"main": self,
	"ticketscounter": tickets
	
}


// Quick reset implementation
var resetCount = 0;


// You need to start something when this game mode is run? Put it in here!
function start () {
	castor.connect();
}


// Whatever you need to stop when you stop the game mode, put them commands in here.
function stop () {
	console.log("Stopping game mode...");
	castor.disconnect();
}




/* ------------------------ GAME MODE SETUP ------------------------ */
/*  Here are all the events related to the game mode being handled */



// CASTOR

castor.on('io', function (samples, source) {
	if (source == "013a20407940d8") knapp.updateButtons(samples[0]);
});




// KNAPP

// A button has been pressed
knapp.on('pressed', function (button) {
	
	console.log("Button " + button + " pressed.");
	
	// Start the counter
	tickets.start();
	
	// Blue button
	if (button == 3) {
		tickets.toggle(1);
		knapp.light(0, false);
		knapp.light(1, false);
		knapp.light(2, true);
		Sound.play("blue_team_has_captured_the_base");
	}
	
	// Red button
	if (button == 4) {
		tickets.toggle(0);
		knapp.light(0, true);
		knapp.light(1, false);
		knapp.light(2, false);
		Sound.play("red_team_has_captured_the_base");
	}
	
	// White button
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






// TICKETCOUNTER

tickets.on('started', function () {
	
	console.log('Ticket counter started');
	
});


// When any of the timers has reached zero
tickets.on('ended', function (side) {
	
	// Kill all lights
	knapp.light(0, false);
	knapp.light(1, false);
	knapp.light(2, false);
	
	console.log('Match ended! ' + side + ' lost.');
	
	// Tell the players who won
	if (side == 0) {
		Sound.play(["game_over","blue_team", "lost", "please_try_again"]);
	} else {
		Sound.play(["game_over","red_team", "lost", "please_try_again"]);
	}
	
});


// Whenever side has been switched
tickets.on('toggled', function (side) {
	
	console.log('Toggled to team ' + side);
	
});


// Whenever the status updates for any team, i.e. when the clock moves a second
tickets.on('update', function (time) {
	
	console.log("Team A: " + time[0] + " Team B: " + time[1]);
	
	if (time[0] == publicVariables.warnLimit) console.log(publicVariables.warnLimit + " secs left for team 0");
	if (time[1] == publicVariables.warnLimit) console.log(publicVariables.warnLimit + " secs left for team 1");
	
});












// Makes sure the start() and stop() functions are accessible from the outside.
exports.start = start;
exports.stop = stop;