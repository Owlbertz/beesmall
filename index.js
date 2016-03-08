var server = require('./util/server'),
  Cache = require('./util/cache'),
  app = require('./util/util');



// print cache info
if (process.argv.indexOf('--cacheinfo') !== -1) {
  app.cache = new Cache(app);
  app.cache.getSize(function(err, size) {
    var maxCacheSize = app.config.server.cache.size;

    app.log.info('Cache size: ' + size + ' / ' + maxCacheSize + ' bytes');
    app.log.info('Cache level: ' + ((size/maxCacheSize) * 100).toFixed(2) + ' %');
    process.exit();
  });

  return;
}

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
  // create and register cache
  app.cache = new Cache(app);
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


