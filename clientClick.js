/**
 * "Client Click" node.js
 * 
 * @author Pedro Moreira <pmoreira@estg.ipvc.pt> 2014.03.04
 * @version 0.2 | 2014.03.19
 * 
 */


// modulo com servidor http
var 	http 		= require('http'),			//  http server
		static		= require('node-static'),	//  static server
		io			= require('socket.io');
		
var server = http.createServer(handler);

// new fileserver for static content
// static content is at the 'static' directory
// notice: no need to prepend the full path to serve the file
var fileServer = new static.Server('./static');

function handler(request, response) {
	    request.addListener('end', function () {
			// if no filepath, serves cvisual.html by default
		    // console.log("----"+request.url");
	        fileServer.serve(request, response, function (e, resp) {
				var filePath = request.url;
				console.log("==="+filePath);
				if (e && e.status == 404) {
					if (filePath == '/') {
						httpcode = 200;
						filePath = 'clientClick.html';
					} else {
						httpcode = 404;
						filePath = 'errorWorld.html';
					}
				}
                fileServer.serveFile(filePath, httpcode, {}, request, response);
				});
	    });
	    request.resume();
}

// to manage connected clients
var connectedClients = new Array();
var id=0;

// attach a socketio interface to the server
var socketio = io.listen(server);

socketio.sockets.on('connection', function(client) {
  	if (client.send) {console.log('ok');} else {console.log('nok');}
  
  	connectedClients.push(client);
  	count = connectedClients.length;
  	
  	client.emit("logged",{"id":id});
  	id++;
   // emit a count message to all
   
   socketio.sockets.emit('count',{"count":count});
      
   // on disconnect from any client
   // updates connectedClients and sends count message
   client.on('disconnect', function () {
		connectedClients.splice(connectedClients.indexOf(client), 1);
        count = connectedClients.length;
        socketio.sockets.emit('count', {"count": count});
    });
    
    client.on("click", function(data) {
    	socketio.sockets.emit("click",data);
    });
           
   return;

  });

var port = process.env.PORT || 5000;
server.listen(port);

