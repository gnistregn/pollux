var util = require('util');
var events = require('events').EventEmitter;
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var self;


function Castor () {
	if (false === (this instanceof Castor)) {
		return new Castor();
	}
	events.call(this);
	
	
	self = this;
	
	
	var serial = new SerialPort ('/dev/cu.usbserial-A6008hYV', {
		baudrate: 57600,
		parser: serialport.parsers.readline('\n')
	});
	
	
	serial.on("data", function (data) {
		if (data.charCodeAt(0) == 0x7E) {
			process(data.substring(1));
		}
	});
	
	
	
};

util.inherits(Castor, events);


function process (data) {
	var command = data.charAt(0);
	var channel = data.charCodeAt(1);
	var data1	= data.charCodeAt(2);
	var data2	= data.charCodeAt(3);
	var sender	= data.substring(4);
	var senderID = "";
	for (i = 0; i < 8; i++) {
		senderID += '' + sender.charCodeAt(i).toString(16);
	}
	
	//console.log("Cmd: " + command + " Channel: " + channel + " Data1: " + data1 + " Data2: " + data2 + " Sender: " + senderID);
	
	// I/O
	if (command == 'I') {
		self.emit('io', data1);
	}
	
	// Voltage
	if (command == 'V') {
		self.emit('voltage', x.charCodeAt(1));
	}

}


Castor.prototype.process = process;

Castor.prototype.send = function (msg) {
	console.log("CASTOR SEND: " + msg);
	//serial.write(msg);
}


module.exports = Castor;