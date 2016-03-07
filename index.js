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
  //try {
    handler.serve(request, response, app);
  //} catch (err) {
    //app.log.error('Failed to handle request:', err);
  //}
};

/**
 * Runs on server start.
 */
var onStartUp = function() {
  if (process.env.NODE_ENV) {
    app.log.info('Environment: ' + process.env.NODE_ENV);
  } else {
    app.log.info('No environment defined');
  }
  app.cache = new Cache(app);
  app.log.info('Server has started on port ' + app.config.server.port);
};

process.on('SIGINT', function() {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
  // some other closing procedures go here
  process.exit(0);
})


//try {
  http.createServer(onRequest).listen(app.config.server.port);
  onStartUp();
//} catch(err) {
  //app.log.error('Start up failed: ', err);
  //process.exit(0);
//}
