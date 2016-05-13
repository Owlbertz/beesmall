var server = require('./util/server'),
  Cache = require('./util/cache'),
  handler = require('./handler'),
  app = require('./util/util');


app.cache = new Cache(app);

exports.setConfig(config) {
  app.setConfig(config);
};

exports.serve = function(request, response, callback) {
  return handler.serve(request, response, app, callback);
};

