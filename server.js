var fs          = require('fs'),
    path        = require('path'),
    serveStatic = require('serve-static'),
    jsonServer  = require('json-server'),
    bodyParser  = require('body-parser'),
    server      = jsonServer.create(),
    baseDir     = 'app',
    port        = 3000,
    router      = jsonServer.router('./db/db.json'),
    middlewares = jsonServer.defaults(),
    Vision      = require('@google-cloud/vision'),
    projectId   = 'epam-lab11';

process.env.GOOGLE_APPLICATION_CREDENTIALS = './keyfile.json';

// Instantiates a client
const visionClient = Vision({
  projectId: projectId
});
 
server.enable('strict routing');

var validRoutes = [
  '/',
  '/search/?',
  '/popular/?',
  /page\d+\/?/,
  '/upload/?',
  '/about/?',
  '/contacts/?'
];

// sends index.html on request
function sendIndex(request, response, next) {
  response.sendFile(path.join(__dirname, baseDir, 'index.html'));
}

// sets handlers for valid routes
for (var i = 0; i < validRoutes.length; i++) {
  server.use(validRoutes[i], serveStatic(path.join(__dirname, baseDir)));
  server.get(validRoutes[i], sendIndex);
}

server.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

server.use(bodyParser.json()); // for parsing application/json
server.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

server.post('/vision', debounce((req, res, next) => {
  let data = {};

  // The name of the image file to annotate
  const fileName = req.body.url;

  // Performs label detection on the image file
  let  p1 = visionClient.detectLabels(fileName)
    .then((results) => {
      const labels = results[0];
      data.labels = labels;

    })
    .catch((err) => {
      console.error('ERROR:', err);
    });

  let p2 = visionClient.detectSafeSearch(fileName)
    .then((results) => {
      const detections = results[0];
      data.adult = detections.adult;
      data.violence = detections.violence;
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });

  Promise.all([p1, p2])
    .then(() => {
      res.send(data);
    });

}, 500));

// Set default middlewares (logger, static, cors and no-cache) 
server.use('/api', middlewares);

// Use default router 
server.use('/api', router);
 
server.listen(port, function () {
  console.log('JSON Server is running at port ' + port);
});