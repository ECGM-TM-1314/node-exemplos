/**
 * "Hello World" node.js
 * 
 * @author Pedro Moreira <pmoreira@estg.ipvc.pt> 2014.03.04
 * @version 0.1
 * 
 */


// modulo com servidor http
var 	http 		= require('http'),			//  http server
		static		= require('node-static');	//  static server
		
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
						filePath = 'helloWorld.html';
					} else {
						httpcode = 404;
						filePath = 'errorWorld.html';
					}
				}
                fileServer.serveFile(filePath, httpcode, {}, request, response);
				});
	    });
}
var port = process.env.PORT || 5000;
server.listen(port);

