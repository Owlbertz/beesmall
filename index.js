var server = require('./util/server'),
  Cache = require('./util/cache'),
  handler = require('./handler'),
  app = require('./util/util');


app.cache = new Cache(app);
exports.serve = function(request, response) {
  return handler.serve(request, response, app);
};

