exports.default = {
  server: {
    port: 8888, // Port to run on
    source: '/path/to/images/', // Images source path
    useImageMagick: false, // true if Image Magick should be used instead of Graphics Magick
    validFormats: ['jpg', 'jpeg', 'png'], // File extensions that are processed; lower case
    cache: {
      touch: true, // if last used file should be touched to stay in cache longer
      path: 'cache/', // Path to save cached images
      size: 200000 // Max size of the cache folder in Bytes
    },
    log: {
      level: 'debug', // Log level
      path: '' // Path of log file
    }
  }, 
  images: { // Image types that are supported
    small: {
      width: 200,
      height: 150
    }, 
    medium: {
      width: 400,
      height: 300
    }, 
    large: {
      width: 800,
      height: 600
    }
  }
};

exports.marius = {
  server: {
    source: '/home/marius/Desktop/images/',
    cache: {
      size: 150000 // 150 KB
    }
  }
};

