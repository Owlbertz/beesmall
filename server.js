var server = require('./util/server'),
  app = require('./util/util');

/**
 * Runs on server start.
 */
var onStartUp = function() {
  app.log.info('Starting beesmall server...');
  if (process.env.NODE_ENV) {
    app.log.info('Environment: ' + process.env.NODE_ENV);
  } else {
    app.log.info('No environment defined');
  }

  app.log.info('Server has started on port ' + app.config.server.port);
};

// try to start server
try {
  server.start(app); 
  onStartUp();
} catch(err) {
  app.log.error('Start up failed: ', err);
  process.exit();
}