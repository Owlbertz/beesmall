var fs = require('fs'),
  gm = require('gm'),
  url = require('url');

/**
 * Serves an image according to the HTTP request.
 * @param {Object} request - HTTP request object.
 * @param {Object} response - HTTP response object.
 * @param {Object} app - App util object.
 */
var serve = function(request, response, app) {
  var path = parsePath(url.parse(request.url).pathname);
    imageSize = path.size,
    imageName = path.name,
    imageType = getImageType(imageName),
    imagePath = app.config.images.source + imageName,
    imageConfig = app.config.images.types[imageSize],
    cacheImageName = imageSize + '_' + imageName.replace('/','_'),
    cacheImagePath = app.config.server.cache.path + cacheImageName;

  if (!path.name) { // if no URL is transmitted
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write('Hi.');
    response.end();
    return;
  }

  if (typeof imageConfig === 'undefined') {
    app.log.warn('Image type', imageType, 'not defined!');
    response.writeHead(500, {'Content-Type': 'text/plain'});
    response.write('Invalid request: ' + imageSize + ' is not defined.');
    response.end();
    return;
  }

  if (app.config.server.useImageMagick) { // if Image Magick should be used
    gm = gm.subClass({imageMagick: true});
  }

  if (app.config.images.validFormats.indexOf(imageType.toLowerCase()) === -1) { // image should not be processed -> return as is
    fs.readFile(path, 'binary', function (err, file) { // check if image already exists
      if (err) {
        if (err.errno === -2) { // image not found
          app.log.warn('Image not found:', imagePath);
          response.writeHead(404, {'Content-Type': 'text/plain'});
          response.write('Image not found.');
          response.end();
        } else { // other error
          app.log.error(err);
          response.writeHead(500, {'Content-Type': 'text/plain'});
          response.write(err);
          response.end();
        }
      } else { // image found
        response.writeHead(200, {'Content-Type': 'image/'+imageType});
        response.write(file, 'binary');
        response.end();
      }
    });
  } else { // Image type should be processed
    app.cache.load(cacheImageName, function(file) {
      // cached image found
      response.writeHead(200, {'Content-Type': 'image/'+imageType});
      response.write(file, 'binary');
      response.end();
    }, function(err) {
      var imageQuality = imageConfig.quality || (app.config.images.quality || 100);
      // cached image not found
      gm(imagePath)
        .thumb(imageConfig.width, imageConfig.height, cacheImagePath, imageQuality, function (err, stdout, stderr, command) {
          if (err) {
            if (err.code === 1) {
              app.log.warn('Image not found:', imagePath);
              response.writeHead(404, {'Content-Type': 'text/plain'});
              response.write('Image not found.');
              response.end();
            } else {
              app.log.error('Unexpected error while downsizing:', err);
              response.writeHead(500, {'Content-Type': 'text/plain'});
              response.write('Error downsizing.');
              response.end();
            }
          } else {
            app.log.debug('Downsizing successful. Saved as', cacheImagePath);
            app.cache.load(cacheImageName, function(file) {
              // image found
              response.writeHead(200, {'Content-Type': 'image/'+imageType});
              response.write(file, 'binary');
              response.end();
            });
            // manage cache to clear old images
            app.cache.manage();
          }
        });
    }, true);
  }

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
    name: p.slice(2).join('/').replace(/%20/g, ' ') // everything after second slash is image path
  };
};


exports.serve = serve;