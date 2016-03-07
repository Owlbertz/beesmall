var http = require('http'),
  handler = require('./handler'),
  Cache = require('./util/cache'),
  app = require('./util/util');

/**
 * Handles HTTP requests.
 * @param {Object} request - HTTP request object.
 * @param {Object} response - HTTP response object.
 */
var onRequest = function(request, response) {
  try {
    handler.serve(request, response, app);
  } catch (err) {
    app.log.error('Failed to handle request:', err);
  }
};

/**
 * Runs on server start.
 */
var onStartUp = function() {
  app.log.info('Starting resize-on-request server...');
  if (process.env.NODE_ENV) {
    app.log.info('Environment: ' + process.env.NODE_ENV);
  } else {
    app.log.info('No environment defined');
  }
  app.cache = new Cache(app);
  app.log.info('Server has started on port ' + app.config.server.port);
};


process.on('SIGINT', function() {
  app.log.nl().info('Shutting down resize-on-request server...');
  // some other closing procedures go here
  server.close(function() {
    app.log.info('Done. Bye bye...');
    app = null;
    process.exit();
  });
});



// Maintain a hash of all connected sockets
var server, sockets = {}, nextSocketId = 0;

try {
  server = http.createServer(onRequest).listen(app.config.server.port);
  onStartUp();
} catch(err) {
  app.log.error('Start up failed: ', err);
  process.exit();
}

server.on('connection', function (socket) {
  // Add a newly connected socket
  var socketId = nextSocketId++;
  sockets[socketId] = socket;
  //console.log('socket', socketId, 'opened');

  // Remove the socket when it closes
  socket.on('close', function () {
    //console.log('socket', socketId, 'closed');
    delete sockets[socketId];
  });

  // Extend socket lifetime for demo purposes
  //socket.setTimeout(500);
});