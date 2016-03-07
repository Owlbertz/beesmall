var fs = require('fs'),
  exec = require('child_process').exec,
  getFolderSize = require('get-folder-size'),
  config = require('./config');

/**
 * Loads an element from the cache.
 * @param {String} filename - Name of the file to load.
 * @param {Function} foundFn - Function to be executed when the file is found.
 * @param {Function} notFoundFn - Function to be executed when the file is not found.
 * @param {String} touchOnFound - If the file should be touched if it is found.
 */
var load = function(fileName, foundFn, notFoundFn, touchOnFound) {
  var path = config.server.cache.path + fileName;
  fs.readFile(path, 'binary', function (err, file) { // check if image already exists
    if (err) {
      if (err.errno === -2) { // cached image not found
        notFoundFn(err);
      } else { // other error
        console.log(err);
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write(err);
        response.end();
      }
    } else { // cached image found
      if (touchOnFound) {
        update(fileName);
      }
      foundFn(file);
    }
  });
};

/**
 * Updates the cache by touching a given element.
 * @param {String} filename - Name of the file to touch.
 */
var update = function(fileName) {
  exec('touch ' + config.server.cache.path + fileName, function(error, stdout, stderr) {
    console.log('Touched ' + config.server.cache.path + fileName);
  });
};

/**
 * Cleans the cache by deleting the oldest element.
 * @param {Number} size - Current size of the cache.
 */
var clean = function(size) {
  console.log('Calling clean!');
  exec('ls -t ' + config.server.cache.path, function(error, stdout, stderr) {
    var files = stdout.replace('  ', ' ').replace(/\n/g,',').split(',');
    files.pop(); // remove last element from list since this is empty string
    exec('rm -v ' + config.server.cache.path + files[files.length-1], function(error, stdout, stderr) {
      console.log(stdout);
    });
  });
};

/**
 * Checks if the cache is too filled and calls clean if nesseccary.
 */
var manage = function() {
  var maxCacheSize = config.server.cache.size;

  getFolderSize(config.server.cache.path, function(err, size) {
    if (err) { throw err; }
    console.log('Cache size: ' + size + ' / ' + maxCacheSize + ' bytes');
    console.log('Cache level: ' + ((size/maxCacheSize) * 100).toFixed(2) + ' %');

    if (size >= maxCacheSize) {
      console.log('Cache too filled...');
      clean(size);
    }
  });
};

/**
 * Creates cache folder if not exists.
 */
var create = function() {
  exec('mkdir -pv ' + config.server.cache.path, function(error, stdout, stderr) {
    console.log(stdout);
  });
};

exports.create = create;
exports.load = load;
exports.manage = manage;