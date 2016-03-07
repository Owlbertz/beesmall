var http = require('http'),
  handler = require('./handler'),
  config = require('./config'),
  cache = require('./cache');



/**
 * Handles HTTP requests.
 * @param {Object} request - HTTP request object.
 * @param {Object} response - HTTP response object.
 */
var onRequest = function(request, response) {
  try {
    handler.serve(request, response);
  } catch (err) {
    console.error('Failed to handle request:', err);
  }
};

/**
 * Runs on server start.
 */
var onStartUp = function() {
  if (process.env.NODE_ENV) {
    console.log('Environment: ' + process.env.NODE_ENV);
  } else {
    console.log('No environment defined');
  }
  cache.create();
  console.log('Server has started on port ' + config.server.port);
};


try {
  http.createServer(onRequest).listen(config.server.port);
  onStartUp();
} catch(err) {
  console.error('Start up failed: ', err);
}
