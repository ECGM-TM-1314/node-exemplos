/**
 * "Hello World" node.js
 * 
 * @author Pedro Moreira <pmoreira@estg.ipvc.pt> 2014.03.04
 * @version 0.1
 * 
 */


// modulo com servidor http
var http = require('http');			//  http server

// cria o servidor a receber requeste no poro 5000
var server = http.createServer(handler);
var port = process.env.PORT || 5000;
server.listen(port);


// quando ouver requests
function handler(request, response) {
	// header HTML e cstatus code 200 (OK)
	response.writeHead(200, {'Content-Type': 'text/html' });
	// corpo 
	response.end("<h1>Hello World!!</h1>");	
	}

