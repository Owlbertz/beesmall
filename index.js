var http = require('http'),
  router = require('./router'),
  handler = require('./handler'),
  config = require('./config');

/**
 * Handles HTTP requests.
 * @param {Object} request - HTTP request object.
 * @param {Object} response - HTTP response object.
 */
var onRequest = function(request, response) {
  try {
    handler.serve(request, response);
  } catch (err) {
    console.error(err);
  }
};

if (process.env.NODE_ENV) {
  console.log('Environment: ' + process.env.NODE_ENV);
} else {
  console.log('No environment defined');
}
http.createServer(onRequest).listen(config.server.port);
console.log('Server has started on port ' + config.server.port);