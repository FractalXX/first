const http = require('http');

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

function handleRequest(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end("hello world\n");
}

http.createServer(handleRequest).listen(port, ipaddress);