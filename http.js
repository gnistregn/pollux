var http = require("http");
var url = require("url");
var util = require('util');
var events = require('events').EventEmitter;
var self;






function Http () {
	if (false === (this instanceof Http)) {
		return new Http();
	}
	events.call(this);
	
	
	self = this;
	
	
	
	
	
	http.createServer(function(request, response) {
		response.writeHead(200, {"Content-Type": "text/plain"});
		var parts = url.parse(request.url, true);
		var params = parts.search.substring(1).split('&');
		for (param in params) {
			
			var pair = params[param].split('=');
			if (pair[0] != undefined && pair[1] != undefined) {
				self.emit('update', pair[0], pair[1]);
			}
			
		}
		response.end();
	}).listen(8888);

	console.log('HTTP Service started');

	
	
	
};

util.inherits(Http, events);




//Castor.prototype.process = process;




module.exports = Http;