var colors = require('colors');
var util = require('util');
var events = require('events').EventEmitter;
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var portOffset = 0; // What port we're trying to connect to
var frameOffset = 1; // Incremental ID used to identify packet frames sent to Xbee module
var serial; // Our serial port instance
var self; // This object!

util.inherits(Castor, events);


// These variables are accessible from outside this object
// By putting them in an object we can pass them by reference
var publicVariables = {
	someSillyCastorVariable: 100
}






function Castor () {
	
	
	if (false === (this instanceof Castor)) {
		return new Castor();
	}
	events.call(this);
	
	self = this;
	this.publicVariables = publicVariables;
	
	

};








function disconnect () {
	console.log("Disconnecting serial...".grey);
	serial.close();
}




// Scan for serial ports and try connection
function scan () {
	
	
	if (portOffset == 0) console.log("Scanning for serial ports...".grey);
	
	serialport.list(function (err, ports) {
		
		// List all available serial ports
		var portCount = ports.length;
		/*console.log("Available serial ports: ");
		var portCount = 0;
		ports.forEach(function(port) {
			portCount++;
			console.log(portCount + ": " + port.comName);
		});*/
		
		if (portOffset < portCount) {
			connect(ports[portOffset].comName, scan);
		} else {
			console.log("Sorry, couldn't open any serial port. Exiting.".red);
			process.exit();
		}
		
		
	});
	
	
}






// Try connecting to serial port
function connect (port, callback) {

	var msg = "	- Trying connection to " + port + "...";
	console.log(msg.grey);

	// Create serial port connection
	serial = new SerialPort(port, {
		
		baudrate: 57600
		
	});
	

	// When a serial port fails to open
	serial.on('error', function (error) {
		
		console.log(String("	  " + error).red);
		
		// Try the next one
		portOffset++;
		callback();
		
	});
	
	
	// When a serial port has been opened
	serial.on('open', function () {
		
		portOffset = 0;
		
		console.log("	  Serial port opened!\n".green);

		console.log("Asking for node discovery...".grey);
		serial.write(new Buffer([0x7E, 0x00, 0x04, 0x08, 0x01, 0x4E, 0x44, 0x64])); // Send a message to the entire network asking for units to announce themselves
		
	});


	// This byte buffer will be the container for all data received through the serial port
	var readData = new Buffer(0);
	
	// When serial data is received
	serial.on("data", function (data) {
		
		console.log("Incoming data length: " + data.length);
		
		// Add the incoming data to the existing byte buffer
		if (readData.length == 0) {
			readData = data;
		} else {
			readData = Buffer.concat([readData, data]);
		}
		
		
		console.log("Data buffer is now " + readData.length + " bytes");
		
		// Is there a command header byte in the byte buffer we haven't dealt with yet?
		// Let's iterate through the buffer looking for one.
		var headerFound = false;
		for (i = 0; i < readData.length; i++) {
			
			// If we have found a command header byte
			if (readData[i] == 0x7E) {
				
				headerFound = true;
				
				packetStartOffset = i; // Let's save the position where we found the command byte
				payloadSize = readData[i + 2]; // And let's save the byte telling us how big the command data payload is
				packetFrameId = readData[i + 3]; // And the frame ID
				packetEnd = packetStartOffset + payloadSize + 4; // Calculate where the packet data ends
				
				// if the data buffer is big enough to carry our supposed packet...
				if (packetEnd <= readData.length) {
					
					packet = readData.slice(packetStartOffset, packetEnd); // Fetch the command packet out of the data buffer
					console.log("Packet is complete. Size: " + packet.length);
					packetType = readData[i + 3]; // What kind of packet is this?
					console.log("Type: " + packetType.toString(16));
					extract(packet); // Extract the payload from the packet
					readData = readData.slice(packetEnd); // Whatever might be left after we've sliced out the command, keep it
					console.log("Sliced buffer, new length: " + readData.length);
				} else {
					console.log("Too short...");
				}
			}
		}
		console.log("Header found? " + headerFound);

	});
}


// Go through the packet and check what stuff it contains
function extract (p) {

	var frameType = packet[3]; // Save frame type
	var payloadSize = packet[2].toString(10); // How many bytes is this packet?
	console.log("	frame type: " + frameType.toString(16));
	console.log("	payload size: " + payloadSize + " bytes");
	
	
	// AT Command Response
	if (frameType == 0x88) {
		
		var atCommand = String.fromCharCode(packet[5].toString(10)) + String.fromCharCode(packet[6].toString(10)); // Stringify the AT command
		
		var commandStatus = packet[7]; // So how did it go? (0 = OK)
		
		var commandData = new Buffer(0); // Byte buffer for whatever data the command returned
		for (i = 0; i < payloadSize - 4; i++) commandData += String.fromCharCode(packet[i + 8]); // Fill the byte buffer
		
		
		console.log("		at command: " + atCommand);
		console.log("		command status: " + commandStatus.toString(10));
		console.log("		command data: " + commandData);
		
		
		
		// Node Discover
		if (atCommand == "ND") {
			
			// Get 64-bit address of sender
			var sourceAddress64 = "";
			for (i = 0; i < 8; i++) sourceAddress64 += '' + packet[i + 10].toString(16);

			// Get 16-bit address of sender
			var sourceAddress16 = packet[8].toString(16) + packet[9].toString(16);
			
			// Get name string of sender, if any
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
			
			// How is the sender configured?
			var deviceType = packet[nodeIdentifierEnd + 3];
			
			
			
			console.log("		64-bit source address: " + sourceAddress64);
			console.log("		16-bit source address: " + sourceAddress16);
			console.log("		node identifier: " + nodeIdentifier);
			console.log("		device type: " + deviceType);
			
			
		}
		
		
		
	}
	
	
	
	
	// IO Data Sample Rx
	if (frameType == 0x92) {
		
		// Get 64-bit address of sender
		var sourceAddress64 = "";
		for (i = 0; i < 8; i++) sourceAddress64 += '' + packet[i + 4].toString(16);

		// Get 16-bit address of sender
		var sourceAddress16 = packet[12].toString(16) + packet[13].toString(16);
		
		// Get bytes carrying I/O data
		var digitalSamplesA = packet[19];
		var digitalSamplesB = packet[20];

		console.log("		64-bit source address: " + sourceAddress64);
		console.log("		16-bit source address: " + sourceAddress16);
		console.log("			digital samples a: " + digitalSamplesA.toString(2));
		console.log("			digital samples b: " + digitalSamplesB.toString(2));
		
		// Send event carrying I/O bytes and who sent it
		self.emit('io', [digitalSamplesA, digitalSamplesB], sourceAddress64);
		
		
	}
	
	
	// Node Identification Indicator
	if (frameType == 0x95) {
		
		// Get 64-bit address of sender
		var sourceAddress64 = "";
		for (i = 0; i < 8; i++) sourceAddress64 += '' + packet[i + 4].toString(16);

		// Get 16-bit address of sender
		var sourceAddress16 = packet[12].toString(16) + packet[13].toString(16);
		
		// Get name string of sender, if any
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






// Transmit digital I/O toggles
function setOutput (pin, state) {
	
	
	var pinByte = 0x31 + pin; // Which pin are we toggling?
	
	var digitalState = state ? 0x05 : 0x04; // 0x05: high, 0x04: low
	
	var header = new Buffer([0x7E, 0x00, 0x10]); // Frame header, size is 0x10 bytes
	
	var command = new Buffer([0x17, ++frameOffset]); // Command is I/O operation, with frame id incremented
	
	var destinationAddress64 = new Buffer([0x00, 0x13, 0xA2, 0x00, 0x40, 0x79, 0x40, 0xd8]); // Serial number of unit receiving command
	
	var destinationAddress16 = new Buffer([0xFF, 0xFE]); // 0xFF + 0xFE if unknown
	
	var commandOptions = new Buffer([0x02, 0x44, pinByte, digitalState]); // Compile command
	
	var checksumBytes = Buffer.concat([command, destinationAddress64, destinationAddress16, commandOptions]); // Create buffer to calculate checksum from

	// So, what's the checksum of all this jazz?
	var checksum = new Buffer(1);
	var sum = 0;
	for (i = 0; i < checksumBytes.length; i++) {
		sum += checksumBytes[i];
	}
	// Ah, I see! (Only 1 byte is as checksum, the rest is thrown away)
	checksum[0] = 0xFF - (sum & 0xFF);
	
	// Piece together the entire message into a byte buffer
	var message = Buffer.concat([header, checksumBytes, checksum]);

	// Send to Xbee
	serial.write(message);
	
	
}



// Setter
Castor.prototype.setOutput = setOutput;
Castor.prototype.connect = scan;
Castor.prototype.disconnect = disconnect;


module.exports = Castor;




