const http = require('http');

const express = require('express');
const app = express();

function handleRequest(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end("hello world\n");
}

http.createServer(handleRequest).listen(8000);