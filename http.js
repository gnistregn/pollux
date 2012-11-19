var colors = require('colors');
var http = require("http");
var fs = require('fs');
var url = require("url");
var util = require('util');
var events = require('events').EventEmitter;
var self;

var publicModules;




function Http (pModules) {
	
	publicModules = pModules;
	
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
				
				
				// Update parameters in public modules
				var parts = url.parse(request.url, true);
				Object.keys(parts.query).forEach (function (partKey) {
					if (partKey != "module") {
						
						if (typeof	publicModules[parts.query.module].publicVariables[partKey] == "function" && parts.query[partKey].length > 0) {
							publicModules[parts.query.module].publicVariables[partKey]();
						}
						
						if (typeof publicModules[parts.query.module].publicVariables[partKey] == "number" ) {
							publicModules[parts.query.module].publicVariables[partKey] = parseInt(parts.query[partKey]);
						}
						
						if (typeof publicModules[parts.query.module].publicVariables[partKey] == "string" ) {
							publicModules[parts.query.module].publicVariables[partKey] = parts.query[partKey];
						}
						
					}
				});

				
				// List all public modules and their parameters
				Object.keys(publicModules).forEach (function (key){
					response.write("Public module: " + key + "<br>");
					var obj = publicModules[key];
					response.write('<form method="get"><input type="hidden" name="module" value="' + key + '">');
					Object.keys(obj.publicVariables).forEach (function (n) {
						
						// Convert camelCase to Sentence Case
						var sCase = n.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");;
						var readableName = sCase.charAt(0).toUpperCase() + sCase.slice(1); // capitalize the first letter - as an example.
						
						if (typeof obj.publicVariables[n] == "number") response.write("<b>"   + readableName + ' </b>(' + (typeof obj.publicVariables[n]) + ') <input name="' + n + '" value="' + obj.publicVariables[n] + '"><br>');
						if (typeof obj.publicVariables[n] == "function") response.write("<b>" + readableName + ' </b>(' + (typeof obj.publicVariables[n]) + ') <input name="' + n + '" value=""><br>');
					});
					response.write('<input value="Update" type="submit"></form><br><br><br><br>');
				});
				response.end();
				//response.end(content, 'utf-8');
				
				
				
			}
		});
		
	}).listen(8888);

	console.log('HTTP Service started @ port 8888\n'.green);

	
	
	
};

util.inherits(Http, events);




//Castor.prototype.process = process;




module.exports = Http;