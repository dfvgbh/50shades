var jsonServer = require('json-server');
var server = jsonServer.create();
var router = jsonServer.router('./db/db.json');
var middlewares = jsonServer.defaults();

var path = require('path');
var fs = require('fs');
var serveStatic = require('serve-static');
var express = require('express');
 
var baseDir = 'app';
var validRoutes = [
  '/',
  '/about',
  '/asd/:id/'
];

for (var i = 0; i < validRoutes.length; i++) {
  app.use(validRoutes[i], serveStatic(path.join(__dirname, baseDir)));
  app.get(validRoutes[i], function(request, response, next) {
    response.sendFile(__dirname + '/' + baseDir + '/index.html');
});
}

// Set default middlewares (logger, static, cors and no-cache) 
server.use('/api', middlewares);
// Use default router 
server.use('/api', router);
 

server.listen(3000, function () {
  console.log('JSON Server is running');
});