var fs = require('fs'),
  stream = require('stream'),
  gm = require('gm'),
  url = require('url'),
  fileUtil = require('./util/fileUtil');

/**
 * Serves an image according to the HTTP request.
 * @param {Object} request - HTTP request object.
 * @param {Object} response - HTTP response object.
 * @param {Object} app - App util object.
 * @param {Function} callback - Executed once the response has ended.
 */
exports.serve = function(request, response, app, callback) {

  var handleRequest = function() {
    var path = parsePath(url.parse(request.url).pathname);
      imageSize = path.size,
      originalImageName = path.name,
      imageMimeType = getImageMimeType(originalImageName),
      originalImagePath = app.config.images.source + originalImageName,
      imageConfig = app.config.images.sizes[imageSize],
      cacheImageName = fileUtil.generateCacheName(imageSize, originalImageName),
      cacheImagePath = app.config.server.cache.path + cacheImageName,
      customSize = false; // used to detect custom size in request

    if (!path.name) { // if no URL is transmitted
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.write('Hi.');
      response.end();
      callback();
      return;
    }

    // custom image size
    if (typeof imageConfig === 'undefined') {
      customSize = imageSize.match(/(\d{0,4})x(\d{0,4})(@([0-100]))?/);
      if (app.config.images.enableCustom && customSize) { // custom image request
        imageConfig = {
          width: parseInt(customSize[1]),
          height: parseInt(customSize[2]),
          quality: customSize[4] ? parseInt(customSize[4]) : undefined
        };
        app.log.debug('Custom image:', imageConfig);
      } else { // invalid image request
        app.log.warn('Image type', imageSize, 'not defined!');
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write('Invalid request: ' + imageSize + ' is not defined.');
        response.end();
        callback();
      }
    }

    if (app.config.server.useImageMagick) { // if Image Magick should be used
      gm = gm.subClass({imageMagick: true});
    }

    if (!customSize && (!imageMimeType || app.config.images.validFormats.indexOf(imageMimeType.toLowerCase()) === -1)) { // image should not be processed -> return as is
     fs.createReadStream(originalImagePath, 'binary') // load original image
        .on('error', function(err) {
          if (err.errno === -2) { // image not found
            app.log.warn('Image not found:', originalImagePath);
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write('Image not found.');
            response.end();
            callback();
          } else { // other error
            app.log.error(err);
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.write(err);
            response.end();
            callback();
          }
        })
        .pipe(response);
    } else { // Image type should be processed
      app.cache.load(cacheImageName, originalImagePath, function(data) {
        if (data) {
          data.on('data', function(chunk) {
            response.write(chunk);
          })
          .on('end', function() {
            response.end();
            callback();
          });
        } else {
          var imageQuality = imageConfig.quality || (app.config.images.quality || 100);
          // cached image not found
          gm(originalImagePath)
            .thumb(imageConfig.width, imageConfig.height, cacheImagePath, imageQuality, function (err, stdout, stderr, command) {
              if (err) { 
                if (err.code === 1) {
                  app.log.warn('Image not found:', originalImagePath);
                  response.writeHead(404, {'Content-Type': 'text/plain'});
                  response.write('Image not found.');
                  response.end();
                  callback();
                } else {
                  app.log.error('Unexpected error while downsizing:', err);
                  response.writeHead(500, {'Content-Type': 'text/plain'});
                  response.write('Error downsizing.');
                  response.end();
                  callback();
                }
              } else {
                app.log.debug('Downsizing successful. Saved as', cacheImagePath);
                app.cache.put(cacheImageName, originalImageName);
                app.cache.manage();
                fs.createReadStream(cacheImagePath, 'binary')
                  .on('data', function(chunk) {
                    response.write(chunk);
                  })
                  .on('end', function() {
                    response.end();
                    callback();
                  });
              }
          });
        }
      });
    }
  };

  /**
   * Returns the MIME type for a given file.
   * @param {String} fileName - Name of the requested image file.
   * @return {String} MIME type.
   */
  var getImageMimeType = function(fileName) {
    var extension = fileName.split('.').pop(),
      imageTypes = {
        'jpg': 'jpeg',
        'jpeg': 'jpeg',
        'png': 'png'
      };
    return imageTypes[extension] || extension;
  };

  /**
   * Parses the requested path and extracts all information.
   * @param {String} pathname - Requested path.
   * @return {Object} Parsed path.
   */
  var parsePath = function(pathname) {
    if (typeof app.config.server.urlPrefix === 'string' && app.config.server.urlPrefix.length) {
      pathname = pathname.replace(app.config.server.urlPrefix, '');
    }
    var p = pathname.split('/');
    return {
      size: p[1],
      name: p.slice(2).join('/').replace(/%20/g, ' ').replace(app.config.server.pathPrefix, '') // everything after second slash is image path
    };
  };

  // call action
  handleRequest();
};