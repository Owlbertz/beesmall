var fs = require('fs'),
  gm = require('gm'),
  url = require('url'),
  config = require('./config'),
  cache = require('./cache');

/**
 * Serves an image according to the HTTP request
 * @param {Object} request - HTTP request object.
 * @param {Object} response - HTTP response object.
 */
var serve = function(request, response) {
  var path = parsePath(url.parse(request.url).pathname);
    imageSize = path.size,
    imageName = path.name,
    imageType = getImageType(imageName),
    imagePath = config.server.source + imageName,
    imageConfig = config.images[imageSize],
    cacheImageName = imageSize + '_' + imageName.replace('/','_'),
    cacheImagePath = config.server.cache.path + cacheImageName,
    imageQuality = imageConfig.quality || 80;

  cache.load(cacheImageName, function(file) {
    // cached image found
    response.writeHead(200, {'Content-Type': 'image/'+imageType});
    response.write(file, 'binary');
    response.end();
  }, function(err) {
    // cached image not found
    gm(imagePath)
      .thumb(imageConfig.width, imageConfig.height, cacheImagePath, imageQuality, function (err, stdout, stderr, command) {
        if (err) {
          console.log('Error while downsizing: ', err);
          if (err.code === 1) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write('Image not found.');
            response.end();
          } else {
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.write('Error downsizing.');
            response.end();
          }
        } else {
          console.log('Downsizing successful. Saved as ' + cacheImagePath);
          cache.load(cacheImageName, function(file) {
            // image found
            response.writeHead(200, {'Content-Type': 'image/'+imageType});
            response.write(file, 'binary');
            response.end();
          });
          console.log('Calling manage!');
          cache.manage();
        }
      });
  }, true);
};

/**
 * Returns the MIME type for a given file.
 * @param {String} fileName - Name of the requested image file.
 * @return {String} MIME type.
 */
var getImageType = function(fileName) {
  var extension = fileName.split('.').pop(),
    imageTypes = {
      'jpg': 'jpeg',
      'jpeg': 'jpeg',
      'png': 'png'
    };
  return imageTypes[extension];
};

/**
 * Parses the requested path and extracts all information.
 * @param {String} pathname - Requested path.
 * @return {Object} Parsed path.
 */
var parsePath = function(pathname) {
  var p = pathname.split('/');
  return {
    size: p[1],
    name: p.slice(2).join('/') // everything after second slash is image path
  };
};


exports.serve = serve;