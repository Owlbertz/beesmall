var fs = require('fs'),
  gm = require('gm'),
  url = require('url'),
  config = require('./config'),
  cache = require('./cache');

 
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


var getImageType = function(fileName) {
  var extension = fileName.split('.').pop(),
    imageTypes = {
      'jpg': 'jpeg',
      'jpeg': 'jpeg',
      'png': 'png'
    };
  console.log('Image type: ' + imageTypes[extension]);

  return imageTypes[extension];
};

var parsePath = function(pathname) {
  var p = pathname.split('/');
  return {
    size: p[1],
    name: p.slice(2).join('/') // everything after second slash is image path
  };
};


exports.serve = serve;