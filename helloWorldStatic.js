/**
 * "Hello World" with module node-static node.js
 * 
 * @author Pedro Moreira <pmoreira@estg.ipvc.pt> 2014.03.04
 * @version 0.2 | 2014.03.19
 * 
 * this node app will listen to port XXXX (5000 by default)
 * and will serve http static files as it follows
 * http://server:port or http://server:port/ => serves the file helloWorld.html and associated resources (e.g. css files)
 * http://server:port/existing_resource => serves the respective resource (file) and associated resources (e.g. css files)
 * http://server:port/unknow_resource => serves the file errorWorld.html and associated resources (e.g. css files)
 * note: all resources are stored under the 'static' folder that must exist at the folder where this node app is running
 */


// modulo com servidor http
var 	http 		= require('http'),			//  http server
		static		= require('node-static');	//  static server
		
var server = http.createServer(handler);

// new fileserver for static content
// static content is at the 'static' directory/folder
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
						filePath = 'helloWorld.html';
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


var port = process.env.PORT || 5000;
server.listen(port);

