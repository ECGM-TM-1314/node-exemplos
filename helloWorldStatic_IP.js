/**
 * "Hello World" able to distinguish requests by IP
 * 
 * @author Pedro Moreira <pmoreira@estg.ipvc.pt> 2014.03.04
 * @version 0.2 | 2014.03.19
 * 
 * this node app will listen to port XXXX (5000 by default)
 * and will serve http static files depending on the IP and resource
 * will serve publicscreen.html if: origin has same IP as server, request is 'publicscreen.html'
 * will serve clientscreen.html if: IP not the same as the server or any other request
 * 
 */


// http   server module
// static server module (to server static resources)
var 	http 		= require('http');			//  http server
var		static		= require('node-static');	//  static server
var		net 		= require('net');			//  network fundamental services module
var		os 			= require('os');			//  operating system info

// array that stores all the IPs user by the machine
// acting as a server in all its network interfaces

var myIPS = new Array();

function connectionHandler(client) {
    console.log(client.address());
}

// get all network interfaces
var interfaces = os.networkInterfaces();
   console.log(interfaces);
// for each interface
   for(name in interfaces) {
         var interface = interfaces[name];
         interface.forEach(function(entry) {
       		 if(entry.family === 'IPv4') {
        	 myIPS.push(entry.address);
        	 console.log(entry.address);
            // var s = net.createServer(connectionHandler);
            // s.listen(8080, entry.address);
            // console.log('listening on ' + entry.address);
            }
          });
        }

console.log(myIPS);
var server = http.createServer(handler);

// new fileserver for static content
// static content is at the 'static' directory/folder
// notice: no need to prepend the full path to serve the file
var fileServer = new static.Server('./static');

function handler(request, response) {
	    request.addListener('end', function () {
	    	// print out the originating IP
	    	var clientIP = getClientAddress(request);
	    	console.log(clientIP);
	    	
	    	// the public screen will be available *if and only if*
	    	// the request is made to "publicscreen.html" from a
	    	// IP address that matches the server.
	    	// all other requests, either to other resources or
	    	// originated in other IP addresses wil be redirected
	    	// to the 'clientscreen.html'
	    	
	    	// if request is originated at the same address
	    	var filePath = request.url;
	    	console.log(myIPS.indexOf(clientIP));
	    	if(myIPS.indexOf(clientIP) != -1 && filePath == '/public') {
	    		filePath = 'publicscreen.html';
	    		httpcode = 200;
	    	} else {
	    		filePath = 'clientscreen.html';
	    		
	    	}
	    	
	        fileServer.serve(request, response, function (e, resp) {
	        	   console.log(request.url);
				   if (e && e.status == 4045) {
						httpcode = 404;
						filePath = 'clientscreen.html';
					}
                fileServer.serveFile(filePath, httpcode, {}, request, response);
				});
	    });
	    request.resume();
}

getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0] 
        || req.connection.remoteAddress;
};

var port = process.env.PORT || 5000;
server.listen(port);

