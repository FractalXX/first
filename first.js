const http = require('http');

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var express = require('express');
var app = express();

app.get(/^(.+)$/, function(req, res) { res.sendfile('web/' + req.params[0])});

app.listen(port, ipaddress);