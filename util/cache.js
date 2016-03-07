var fs = require('fs'),
  exec = require('child_process').exec,
  getFolderSize = require('get-folder-size');

var Cache = function(app) {
  this.app = app;
  this.create();
};
/**
 * Loads an element from the cache.
 * @param {String} filename - Name of the file to load.
 * @param {Function} foundFn - Function to be executed when the file is found.
 * @param {Function} notFoundFn - Function to be executed when the file is not found.
 * @param {String} touchOnFound - If the file should be touched if it is found.
 */
Cache.prototype.load = function(fileName, foundFn, notFoundFn, touchOnFound) {
  var path = this.app.config.server.cache.path + fileName,
    cache = this,
    app = this.app;
  fs.readFile(path, 'binary', function (err, file) { // check if image already exists
    if (err) {
      if (err.errno === -2) { // cached image not found
        notFoundFn(err);
      } else { // other error
        app.log.error(err);
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write(err);
        response.end();
      }
    } else { // cached image found
      if (touchOnFound) {
        cache.update(fileName);
      }
      foundFn(file);
    }
  });
};

/**
 * Updates the cache by touching a given element.
 * @param {String} filename - Name of the file to touch.
 */
Cache.prototype.update = function(fileName) {
  var app = this.app;
  if (app.config.server.cache.touch) {
    exec('touch ' + app.config.server.cache.path + fileName, function(error, stdout, stderr) {
      app.log.debug('Touched ' + app.config.server.cache.path + fileName);
    });
  }
};

/**
 * Cleans the cache by deleting the oldest element.
 * @param {Number} size - Current size of the cache.
 */
Cache.prototype.clean = function(size) {
  var app = this.app;
  exec('ls -t ' + app.config.server.cache.path, function(error, stdout, stderr) {
    var files = stdout.replace('  ', ' ').replace(/\n/g,',').split(',');
    files.pop(); // remove last element from list since this is empty string
    exec('rm -v ' + app.config.server.cache.path + files[files.length-1], function(error, stdout, stderr) {
      app.log.debug(stdout);
    });
  });
};

/**
 * Checks if the cache is too filled and calls clean if nesseccary.
 */
Cache.prototype.manage = function() {
  var cache = this,
    app = this.app,
    maxCacheSize = app.config.server.cache.size;

  getFolderSize(app.config.server.cache.path, function(err, size) {
    if (err) { throw err; }
    app.log.debug('Cache size: ' + size + ' / ' + maxCacheSize + ' bytes');
    app.log.debug('Cache level: ' + ((size/maxCacheSize) * 100).toFixed(2) + ' %');

    if (size >= maxCacheSize) {
      app.log.debug('Cache too filled...');
      cache.clean(size);
    }
  });
};

/**
 * Creates cache folder if not exists.
 */
Cache.prototype.create = function() {
  var app = this.app;
  app.log.info('Creating cache...');

  exec('mkdir -pv ' + app.config.server.cache.path, function(error, stdout, stderr) {
    app.log.info(stdout);
  });
};


module.exports = Cache;