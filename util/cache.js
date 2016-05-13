var fs = require('fs'),
  stream = require('stream'),
  exec = require('child_process').exec,
  getFolderSize = require('get-folder-size'),
  extend = require('extend'),
  fileUtil = require('./fileUtil');

/**
 * Cache class to manage cached objects.
 * @param {Object} app - App util object containing the config.
 */
var Cache = function(app) {
  this.app = app;
  this.create();

  var cache = this;
  // register scheduler
  if (typeof app.config.server.cache.age === 'number' && app.config.server.cache.age > 0) {
    cache.cleanOld();
    this.scheduler = setInterval(function() {
      cache.cleanOld();
    }, (app.config.server.cache.age * 60 * 1000) / 2); // look for old files every `max-age` / 2 
  }
};

/**
 * Loads an element from the cache.
 * @param {String} cachedFileName - Name of the file to load.
 * @param {String} originalFilePath - Path of the file original file to compate modification times.
 * @param {Function} callback - Function to be executed when the file is not found:
 *                              @param {Stream} data Stream from cached file if found, null if not.
 */
Cache.prototype.load = function(cachedFileName, originalFilePath, cb) {
  var cachedFilePath = this.app.config.server.cache.path + cachedFileName;

  // check if original file is newer than cached file
  if (!fs.existsSync(cachedFilePath) || this._fileIsNewer(originalFilePath, cachedFilePath)) {
    cb(null);
  } else {
    cb(fs.createReadStream(cachedFilePath, 'binary'));
  }
};

/**
 * Puts a new file into the cache.
 * @param {String} fileName - Name of the file to put.
 * @param {String} originalName - Name of the original file.
 */
Cache.prototype.put = function(fileName, originalName) {
  var cache = this,
    app = this.app;
  app.log.debug('Called Cache#put()');
  // store information about file in Cache object
  if (!cache.content[fileName]) {
    app.log.debug('File not yet in cache.');
    cache._getModificationTime(app.config.images.source + originalName, function(modificationtime) {
      app.log.debug('Putting to cache:', fileName, modificationtime);
      cache.content[fileName] = {
        lastAccess: null,
        created: new Date(),
        numberOfAccesses: 0,
        originalModificationTime: modificationtime,
        originalName: originalName
      };
    });
  } else {
    app.log.debug('File already in cache.');
    cache.content[fileName].numberOfAccesses++;
    cache.content[fileName].lastAccess = new Date();
  }
 
  app.log.debug('Put file to cache:', cache.content);
};

/**
 * Updates the cache by touching a given element.
 * @param {String} filename - Name of the file to touch.
 */
Cache.prototype.update = function(fileName) {
  var app = this.app;

  var numberOfAccesses = this.content[fileName] ? this.content[fileName].numberOfAccesses : 0;
  if (this.content[fileName]) {
    this.content[fileName].numberOfAccesses = this.content[fileName].numberOfAccesses + 1;
    this.content[fileName].lastAccess = new Date();
  }
  app.log.debug('Update file in cache:', this.content[fileName]);

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
      cache._removeFromContent(files[files.length-1]);
    });
  });
};

/**
 * Cleans the cache by deleting the oldest element.
 */
Cache.prototype.cleanOld = function() {
  var cache = this,
    app = this.app;

  if (typeof app.config.server.cache.age === 'number' && app.config.server.cache.age > 0) {

    app.log.debug('Checking for files older than ' + app.config.server.cache.age + ' min...');

    exec('find ' + app.config.server.cache.path + ' -mmin +' + app.config.server.cache.age, function(error, stdout, stderr) {
      var files = stdout.split('\n');
      files.pop();  // remove last element from list since this is empty string
      files.shift();  // remove first element from list since this is this folder name

      if (files.length) {
        app.log.debug('Deleting ' + files.length + ' files from cache because of their age is > ' + app.config.server.cache.age + ' min...');
        exec('rm -v ' + files.join(' '), function(error, stdout, stderr) {
          app.log.debug(stdout);
          cache._removeFromContent(files);
        });
      }
      
    });    
  }
  
};


/**
 * Checks if the cache is too filled and calls clean if nesseccary.
 */
Cache.prototype.manage = function() {
  var cache = this,
    app = this.app,
    maxCacheSize = app.config.server.cache.size;

  this.getSize(function(err, size) {
    app.log.debug('Cache size: ' + size + ' / ' + maxCacheSize + ' bytes');
    app.log.debug('Cache level: ' + ((size/maxCacheSize) * 100).toFixed(2) + ' %');

    if (size >= maxCacheSize) {
      app.log.debug('Cache too filled...');
      cache.clean(size);
    }
  });
};

/**
 * Get the current cache size
 * @param {Function} callback - Callback to be executed after the size has been calculated.
 */
Cache.prototype.getSize = function(callback) {
  var cache = this,
    app = this.app;

  getFolderSize(app.config.server.cache.path, function(err, size) {
    if (err) { throw err; }

    callback(err, size);
  });
};

/**
 * Creates cache folder if not exists.
 */
Cache.prototype.create = function() {
  var app = this.app;

  // create cache dir if not exists
  exec('mkdir -pv ' + app.config.server.cache.path, function(error, stdout, stderr) {
    app.log.info(stdout);
  });

  // initialize current content
  this.content = {};

};

/**
 * Checks if file 1 is newer than file 2.
 * @param {String} filePath1 - Path of file 1.
 * @param {String} filePath2 - Path of file 2.
 * @return {Boolean} True if file 1 is newer, false otherwise.
 */
Cache.prototype._fileIsNewer = function(filePath1, filePath2) {
  this.app.log.debug('Comparing ' + filePath1 + ' (original) ' + filePath2 + ' (cached)');
  return fs.statSync(filePath1).mtime > fs.statSync(filePath2).mtime;
};


/**
 * Checks if the given path lies within the cache.
 * @param {String} fileName1 - Name of file 1.
 * @return {Boolean} true if yes, false if not
 */
Cache.prototype._isWithinCachePath = function(filePath) {
  var app = this.app;
  return filePath.indexOf(app.config.server.cache.path) === 0;
};

/**
 * Removes one ore more files from the internal Cache objekt.
 * @param {String|Array} files - Files to be removed.
 */
Cache.prototype._removeFromContent = function(files) {
  if (typeof files === 'string') {
    if (typeof this.content[files] !== 'undefined') {
      this.content[files] = null;
    }
  } else {
    for (var f = 0; f < files.length; f++) {
      if (typeof this.content[files[f]] !== 'undefined') {
        this.content[files[f]] = null;
      }
    }
  }
}

module.exports = Cache;