var util = require('util');
var events = require('events').EventEmitter;
var self;
var phase = 0;
var interval;

var ticketCount;
var tickets;

var warnLimit = 10;

var side = 1;



function TicketCounter () {
	
	ticketCount = 20;
	tickets = new Array(ticketCount, ticketCount);
	
	if (false === (this instanceof TicketCounter)) {
		return new TicketCounter();
	}
	events.call(this);
	self = this;
};

util.inherits(TicketCounter, events);




function countdown () {
	tickets[side]--;
	console.log("tickets: " + tickets);
	
	if (tickets[side] == warnLimit) {
		console.log("Warning! Team " + side + " is down to " + warnLimit + " seconds remaining.");
	}
	
	if (tickets[side] == 0) {
		clearInterval(interval);
		self.emit('ended', side);
	}
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


TicketCounter.prototype.reset = function () {
	clearInterval(interval);
	tickets[0] = ticketCount;
	tickets[1] = ticketCount;
	phase = 0;
}


TicketCounter.prototype.setTickets = function (n) {
	console.log("Tickets > Changed tickets to " + n);
	ticketCount = n;
	self.reset();
}

TicketCounter.prototype.setWarnLimit = function (n) {
	warnLimit = n;
	self.reset();
}




module.exports = TicketCounter;