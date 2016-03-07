var extend = require('extend'),
  config = new Object();


config.default = {
  server: {
    port: 8888, // Port to run on
    source: '/path/to/images/', // Images source path
    cache: {
      path: 'cache/', // Path to save cached images
      size: 200000 // Max size of the cache folder
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

config.marius = {
  server: {
    source: '/home/marius/Desktop/images/',
    cache: {
      size: 250000 // 250 KB
    }
  }
}

module.exports = extend(true, config.default, config[process.env.NODE_ENV]);