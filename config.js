var extend = require('extend'),
  config = new Object();


config.default = {
  server: {
    port: 8888,
    source: '/home/marius/Desktop/images/',
    cache: {
      path: 'cache/',
      size: '200000' // 200 KB
    }
    /*,log: {
      level:
      path:
    }*/
  }, images: {
    'small': {
      width: 200,
      height: 150
    }, 
    'medium': {
      width: 400,
      height: 300
    }, 
    'large': {
      width: 800,
      height: 600
    }
  }
};

config.marius = {
  server: {
    cache: {
      size: 250000
    }
  }
}

console.log('Loading config for: ' + process.env.NODE_ENV);

module.exports = extend(true, config.default, config[process.env.NODE_ENV]);

/*var extend = require('extend'),
  config = require('./config.json');

module.exports = extend(true, config.default, config[process.env.NODE_ENV]);*/
