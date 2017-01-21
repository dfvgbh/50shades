var fs          = require('fs'),
    path        = require('path'),
    serveStatic = require('serve-static'),
    jsonServer  = require('json-server'),
    server      = jsonServer.create(),
    baseDir     = 'app',
    port        = 3000,
    router      = jsonServer.router('./db/db.json'),
    middlewares = jsonServer.defaults();
 
server.enable('strict routing');

var validRoutes = [
  '/',
  '/about/as/?',
  /page\d+\/?/,
  '/upload/?'
];

server.enable('strict routing');

// sends index.html on request
function sendIndex(request, response, next) {
  response.sendFile(path.join(__dirname, baseDir, 'index.html'));
}

// sets handlers for valid routes
for (var i = 0; i < validRoutes.length; i++) {
  server.use(validRoutes[i], serveStatic(path.join(__dirname, baseDir)));
  server.get(validRoutes[i], sendIndex);
}

// Set default middlewares (logger, static, cors and no-cache) 
server.use('/api', middlewares);

// Use default router 
server.use('/api', router);
 
server.listen(port, function () {
  console.log('JSON Server is running at port ' + port);
});