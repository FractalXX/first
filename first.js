const http = require('http');

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var express = require('express');
var app = express();
var path = require('path');

<<<<<<< HEAD
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/web/index.html'));
});

app.listen(port, ipaddress);
=======
http.createServer(handleRequest).listen(port, ipaddress);
>>>>>>> 9af574705a1f6a94be197093f897d3a4380ed661
