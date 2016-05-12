exports.default = {
  server: {
    port: 8888, // Port to run on
    useImageMagick: false, // true if Image Magick should be used instead of Graphics Magick
    cache: {
      touch: true, // if last used file should be touched to stay in cache longer
      path: 'cache/', // Path to save cached images
      size: 200000, // Max size of the cache folder in Bytes
      age: 10 // Max age of files in cache in minutes
    },
    log: {
      level: 'debug', // Log level
      path: '', // Path of log file
      methods: {} // Define own functions for warn, debug, log, error
    },
    urlPrefix: '' // Define an URL prefix that is ignored when accessing the API
  }, 
  images: { 
    quality: 80, // Fallback quality
    source: '/path/to/images/', // Images source path
    validFormats: ['jpg', 'jpeg', 'png'], // File extensions that are processed; lower case
    enableCustom: true, // Enable custom requests like /200x200@100/path/to/image.jpg
    sizes: { // Image sizes that are supported
      small: {
        width: 200,
        height: 150,
        quality: 80
      }, 
      medium: {
        width: 400,
        height: 300,
        quality: 70
      }, 
      large: {
        width: 800,
        height: 600,
        quality: 60
      }
    }
  }
};

exports.marius = {
  server: {
    cache: {
      size: 150000 // 150 KB
    }
  },
  images: {
    source: '/home/marius/Desktop/images/'
  }
};