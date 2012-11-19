var util = require('util');
var events = require('events').EventEmitter;
var self;
var phase = 0;
var interval;
//var ticketCount;
var tickets;
var side = 1;


// These variables are accessible from outside this object
// By putting them in an object we can pass them by reference
var publicVariables = {
	defaultTicketCount: 240,
	reset: reset
}



function TicketCounter () {
	
	tickets = new Array(
		publicVariables.defaultTicketCount, 
		publicVariables.defaultTicketCount
	);
	
	
	if (false === (this instanceof TicketCounter)) {
		return new TicketCounter();
	}
	
	// Make the public variables actually accessible
	this.publicVariables = publicVariables;
	
	events.call(this);
	self = this;
};

util.inherits(TicketCounter, events);




function countdown () {
	tickets[side]--;
	//console.log("tickets: " + tickets);
	
	
	if (tickets[side] == 0) {
		clearInterval(interval);
		self.emit('ended', side);
	} else {
		self.emit('update', tickets);
	}
}


TicketCounter.prototype.poop = function () {
//	console.log("POOOP:");
//	console.log("defaultTicketCount: " + publicVariables.defaultTicketCount);
}


TicketCounter.prototype.start = function () {
	if (phase == 0) {
		self.emit('started');
		interval = setInterval(countdown, 1000);
		phase = 1;
	}
}



TicketCounter.prototype.toggle = function (s) {
	if (phase == 1) {
		side = s;
		self.emit('toggled', s);
	}
}



TicketCounter.prototype.reset = reset;

function reset () {
	console.log("Tickets reset");
	clearInterval(interval);
	tickets[0] = publicVariables.defaultTicketCount;
	tickets[1] = publicVariables.defaultTicketCount;
	console.log("Current variables - tickets: " + publicVariables.defaultTicketCount);
	phase = 0;
}



TicketCounter.prototype.setTickets = function (n) {
	console.log("Tickets > Changed tickets to " + n);
	publicVariables.defaultTicketCount = n;
	self.reset();
}


TicketCounter.prototype.getSide = function () {
	return side;
}

module.exports = TicketCounter;