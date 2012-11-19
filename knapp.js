var util = require('util');
var events = require('events').EventEmitter;
var buttonStates = new Array(0,0,0,0,0,0,0,0);
var transmitter;

function Knapp (t) {
	transmitter = t;
	if (false === (this instanceof Knapp)) {
		return new Knapp();
	}
	events.call(this);
	
};



util.inherits(Knapp, events);



Knapp.prototype.reset = function () {
	buttonStates = new Array(0,0,0,0,0,0,0,0);
}


Knapp.prototype.light = function (pin, state) {
	transmitter.setOutput(pin, state);
	console.log ("Change light " + pin + " to " + state);	
}

Knapp.prototype.lightsOff = function () {
	console.log ("Turning off all lights.");
}




Knapp.prototype.updateButtons = function (a) {
	var self = this;
	var bin = a.toString(2);
	
	var newStates = new Array(8);
	newStates[0] = (a & 128) != 0 ? true : false;
	newStates[1] = (a & 64) != 0 ? true : false;
	newStates[2] = (a & 32) != 0 ? true : false;
	newStates[3] = (a & 16) != 0 ? true : false;
	newStates[4] = (a & 8) != 0 ? true : false;
	newStates[5] = (a & 4) != 0 ? true : false;
	newStates[6] = (a & 2) != 0 ? true : false;
	newStates[7] = (a & 1) != 0 ? true : false;
	
	for (button = 0; button < 8; button++) {
		if (newStates[button] != buttonStates[button]) {
			if (newStates[button] == false) {
				self.emit('released', button);
			}
			if (newStates[button] == true) {
				self.emit('pressed', button);
			}
		}
	}
	
	buttonStates = newStates;
}


module.exports = Knapp;