var util = require('util');
var events = require('events').EventEmitter;
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var portOffset = 0;
var portCount = 0;
var self;
var serial;
var frameOffset = 1;
function Castor () {
	if (false === (this instanceof Castor)) {
		return new Castor();
	}
	events.call(this);
	
	
	
	self = this;
	
	
	

	scan();


	
	
	
};

util.inherits(Castor, events);


function scan () {
	if (portOffset == 0) console.log("Scanning for serial ports...");
	serialport.list(function (err, ports) {
		portCount = ports.length;
		/*console.log("Available serial ports: ");
		var portCount = 0;
		ports.forEach(function(port) {
			portCount++;
			console.log(portCount + ": " + port.comName);
		});*/
		connect(ports[portOffset].comName, scan);
	});
	
}



function connect (port, callback) {
	console.log("Trying connection to " + port + "...");
	serial = new SerialPort(port, {
		baudrate: 57600
	});
	
	
	serial.on('error', function (error) {
		console.log(error);
		portOffset++;
		callback();
	});
	
	
	serial.on('open', function () {
		console.log("Connected!\r\n");
		serial.write(new Buffer([0x7E, 0x00, 0x04, 0x08, 0x01, 0x4E, 0x44, 0x64])); // Node Discover
	});


	
	
	var readData = new Buffer(0);
	


	serial.on("data", function (data) {
		
		
		console.log("Incoming data length: " + data.length);
		if (readData.length == 0) {
			readData = data;
		} else {
			readData = Buffer.concat([readData, data]);
		}
		
		console.log("Data buffer is now " + readData.length + " bytes");
		var headerFound = false;
		for (i = 0; i < readData.length; i++) {
			if (readData[i] == 0x7E) {
				headerFound = true;
				console.log("Packet init found in databuffer " + readData.length + " bytes long. Start offset: " + i + " len: " + readData[i+1] + " " + readData[i+2]);
				packetStartOffset = i;
				payloadSize = readData[i + 2];
				packetFrameId = readData[i + 3];
				packetEnd = packetStartOffset + payloadSize + 4;
				console.log("Payload size: " + payloadSize + " frame id: " + packetFrameId);
				// if the databuffer is big enough to carry our supposed packet...
				if (packetEnd <= readData.length) {
					packet = readData.slice(packetStartOffset, packetEnd);
					console.log("Packet is complete. Size: " + packet.length);
					packetType = readData[i+3];
					console.log("Type: " + packetType.toString(16));
					decode(packet);
					readData = readData.slice(packetEnd);
					console.log("Sliced buffer, new length: " + readData.length);
				} else {
					console.log("Too short...");
				}
			}
		}
		console.log("Header found? " + headerFound);

	});
}



function decode (p) {
	console.log("PROCESS: " + packet);
	
	var frameType = packet[3];
	var payloadSize = packet[2].toString(10);
	console.log("	frame type: " + frameType.toString(16));
	console.log("	payload size: " + payloadSize + " bytes");
	
	
	// AT Command Response
	if (frameType == 0x88) {
		
		var atCommand = String.fromCharCode(packet[5].toString(10)) + String.fromCharCode(packet[6].toString(10));
		
		var commandStatus = packet[7];
		
		var commandData = new Buffer(0);
		for (i = 0; i < payloadSize - 4; i++) commandData += String.fromCharCode(packet[i + 8]);
		
		
		console.log("		at command: " + atCommand);
		console.log("		command status: " + commandStatus.toString(10));
		console.log("		command data: " + commandData);
		
		
		
		// Node Discover
		if (atCommand == "ND") {
			
			var sourceAddress64 = "";
			for (i = 0; i < 8; i++) sourceAddress64 += '' + packet[i + 10].toString(16);

			var sourceAddress16 = packet[8].toString(16) + packet[9].toString(16);
			
			var nodeIdentifier = "";
			var nodeIdentifierEnd = 0;
			for (i = 0; i < 32; i++) {
				if (packet[19 + i] == 0x00) {
					nodeIdentifierEnd = 19 + i;
					break;
				} else {
					nodeIdentifier += String.fromCharCode(packet[19 + i]);
				}
			}
			
			var deviceType = packet[nodeIdentifierEnd + 3];
			
			
			
			console.log("		64-bit source address: " + sourceAddress64);
			console.log("		16-bit source address: " + sourceAddress16);
			console.log("		node identifier: " + nodeIdentifier);
			console.log("		device type: " + deviceType);
			
			
		}
		
		
		
	}
	
	
	
	
	// IO Data Sample Rx
	if (frameType == 0x92) {
		
		var sourceAddress64 = "";
		for (i = 0; i < 8; i++) sourceAddress64 += '' + packet[i + 4].toString(16);

		var sourceAddress16 = packet[12].toString(16) + packet[13].toString(16);
		
		var digitalSamplesA = packet[19];
		var digitalSamplesB = packet[20];

		console.log("		64-bit source address: " + sourceAddress64);
		console.log("		16-bit source address: " + sourceAddress16);
		console.log("			digital samples a: " + digitalSamplesA.toString(2));
		console.log("			digital samples b: " + digitalSamplesB.toString(2));
		
		self.emit('io', [digitalSamplesA, digitalSamplesB], sourceAddress64);
		
		
	}
	
	
	// Node Identification Indicator
	if (frameType == 0x95) {
		
		
		var sourceAddress64 = "";
		for (i = 0; i < 8; i++) sourceAddress64 += '' + packet[i + 4].toString(16);

		var sourceAddress16 = packet[12].toString(16) + packet[13].toString(16);
		
		var nodeIdentifier = "";
		for (i = 0; i < 32; i++) {
			if (packet[25 + i] == 0x00) 
				break;
			else 
				nodeIdentifier += String.fromCharCode(packet[25 + i]);
		}
		console.log("		frame type: " + frameType.toString(16));
		console.log("		64-bit source address: " + sourceAddress64);
		console.log("		16-bit source address: " + sourceAddress16);
		console.log("			node identifier: " + nodeIdentifier);
		
	}
	
	
	
	
	
	
}




// Toggle digital I/O
function setOutput (pin, state) {
	
	
	var pinByte = 0x31 + pin;
	
	var digitalState = state ? 0x05 : 0x04; // 0x05: high, 0x04: low
	
	var header = new Buffer([0x7E, 0x00, 0x10]);
	
	var command = new Buffer([0x17, ++frameOffset]);
	
	var destinationAddress64 = new Buffer([0x00, 0x13, 0xA2, 0x00, 0x40, 0x79, 0x40, 0xd8]);
	
	var destinationAddress16 = new Buffer([0xFF, 0xFE]); // 0xFF + 0xFE if unknown
	
	var commandOptions = new Buffer([0x02, 0x44, pinByte, digitalState]);
	
	var checksumBytes = Buffer.concat([command, destinationAddress64, destinationAddress16, commandOptions]);


	var checksum = new Buffer(1);
	var sum = 0;
	for (i = 0; i < checksumBytes.length; i++) {
		sum += checksumBytes[i];
	}
	checksum[0] = 0xFF - (sum & 0xFF);
	
	
	var message = Buffer.concat([header, checksumBytes, checksum]);

	serial.write(message);
	
	
}




Castor.prototype.setOutput = setOutput;



module.exports = Castor;