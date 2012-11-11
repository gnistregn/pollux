var http = require("http");
var fs = require('fs');
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
		
		fs.readFile('./admin.html', function (error, content) {
			if (error) {
				response.writeHead(500);
	            response.end();
			} else {
				response.writeHead(200, {"Content-Type": "text/html"});
				
				var parts = url.parse(request.url, true);
				var params = parts.search.substring(1).split('&');
				for (param in params) {

					var pair = params[param].split('=');
					if (pair[0] != undefined && pair[1] != undefined) {
						self.emit('update', pair[0], pair[1]);
						response.write(pair[0] + " set to " + pair[1]);
					}

				}
				response.end(content, 'utf-8');
			}
		});
		
	}).listen(8888);

	console.log('HTTP Service started @ port 8888');

	
	
	
};

util.inherits(Http, events);




//Castor.prototype.process = process;




module.exports = Http;