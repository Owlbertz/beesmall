var http = require('http'),
  router = require('./router'),
  handler = require('./handler'),
  config = require('./config');

var onRequest = function(request, response) {
  try {
    handler.serve(request, response);
  } catch (err) {
    console.error(err);
  }
};

http.createServer(onRequest).listen(config.server.port);
console.log('Server has started on port ' + config.server.port);