var http = require('http'),			//  http server
    fs   = require('fs'),			//  filesystem API
    io   = require('socket.io'),	//  web sockets (and more)
	path = require('path'),			//  fs path utilities (e.g. get extension from file path)
	static = require('node-static');//  http server for static content

// array that has the colors to assign to each client
// can be increased or make colors to be created by a procedure

var colors = new Array();

colors[0]='#FFAAAA'; //pink
colors[1]='#AAFFAA'; //light green
colors[2]='#AAAAFF'; //light blue
colors[3]='#AAFFFF'; //light cyan
colors[4]='#FFFFAA'; //light yellow
colors[5]='#FFAAFF'; //light magenta
colors[6]='#FFD700'; //gold
colors[7]='#FF4500'; //orange red
colors[8]='#DDA0DD'; //plum
colors[9]='#ADFF2F'; //green yellowi

ncolors = colors.length;

// the initial id
var id = 0;

// the initial color index
var colorIndex = id % ncolors;

// to manage connected clients
var connectedClients = new Array();

// new fileserver for static content
// static content is at the currente directory
var fileServer = new static.Server('./static');

// server for io
var server = http.createServer(handler);
function handler(request, response) {
	    request.addListener('end', function () {
			// if no filepath, serves cvisual.html by default
		    
	        fileServer.serve(request, response, function (e, res) {
				var filePath = '.' + request.url;
			    if (filePath == './') filePath = 'cvisual_track.html';
				fileServer.serveFile(filePath, 200, {}, request, response);
				});
	    });
	    request.resume();
	}

// attach a socketio interface to the server
var socketio = io.listen(server);

socketio.sockets.on('connection', function(client) {
  
  // this var is different for each connection (client)
  var myColor;
  
  if (client.send) {console.log('ok');} else {console.log('nok');}
  
// on login message
  client.on('login', function(message) {
	//if no color assigned
    if (!myColor) {
	  // assign a color
      myColor = colors[colorIndex];
	  // update color index
	  id = id + 1;
	  colorIndex = id % ncolors;
	
	  // keep track of connected clients
	  connectedClients.push(client);
	  count = connectedClients.length;
	
	  sid = 'm'+id;
		
		// emit() allows to directly send JSON formatted messages (they will be automatically parsed)
		// send() allows sending strings enconding JSON objects, but they need to be parsed it on the receiver.
		
		// emit a logged message to the client with id
		client.emit("logged",{"color":myColor,"id":sid});
		// emit a count message to all
		socketio.sockets.emit('count',{"count":count});
      return;
    }
  });

// on disconnect from any client
// updates connectedClients and sends count message
 client.on('disconnect', function () {
		connectedClients.splice(connectedClients.indexOf(client), 1);
        count = connectedClients.length;
        socketio.sockets.emit('count', {"count": count});
    });
  
// redirects clique data to all clients
  client.on('clique', function (data) {
	// emit to all
	socketio.sockets.emit('clique',data);	
// alternatively broadcast and emit to self
//  client.broadcast.emit('clique',message);
//  client.emit('clique',message);
  });

// redirects move data to all clients
  client.on('move', function (data) {
	// emit to all
	socketio.sockets.emit('move',data);	
// alternatively broadcast and emit to self
//  client.broadcast.emit('move',message);
//  client.emit('move',message);
  });
  
});

// notice: to listen to ports below 1024 you must run your server as root
// var port = process.env.PORT || 80;

var port = process.env.PORT || 5000;
server.listen(port);
