var http = require('http'),			//  http server
    fs   = require('fs'),			//  filesystem API
    io   = require('socket.io'),	//  web sockets (and more)
	path = require('path');			//  path utilities (e.g. get extension from file path)

// array that has the colos to assign to each client
// can be increased or make the colors to be created by a procedure
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
colors[9]='#ADFF2F'; //green yellow


ncolors = colors.length;


// the initial id
var id = 0;
// the initial color index
var colorIndex = id % ncolors;

// a little bit more flexible server
// capable to serve common static ontent as .js files (javacript)
// and .css (stylesheets)

var connectedClients = new Array();


var server = http.createServer(function (request, response) {
 
//    console.log('request starting...');
    
	// if no filepath, serves cvisual.html by default
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './cvisual_track.html';
    
 	// get file extension
    var extname = path.extname(filePath);
	//console.log(extname);
	// adds a proper mime-type to the response header
    switch (extname) {
        case '.css':
            contentType = 'text/css';
            break;
		case '.js':
            contentType = 'application/javascript';
            break;
		default:
			contentType = 'text/html';
    }

//	console.log(contentType);
     
	// check if requested file exists
    fs.exists(filePath, function(exists) {
     	// if exists, serve it with proper mime.type
		// else send the proper status code
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
		            response.writeHead(500);
                    response.end();
                }
                else {
					response.writeHead(200, {"Content-Type": contentType});
					response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
     
});

/*
var server = http.createServer(function(request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });
  
  var rs = fs.createReadStream(__dirname + '/cvisual.html');
  sys.pump(rs, response);
});
*/

// ataache a socketio interface to the server
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
		// send() allows sending strings enconding JSON objects, but they to be parsed it on the receiver.
		
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
