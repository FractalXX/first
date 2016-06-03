const http = require('http');

function handleRequest(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end("hello world\n");
}

http.createServer(handleRequest).listen(8000);

app.get('/', function (req, res) {
    res.status('200').send('Service is up');
});