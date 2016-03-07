var extend = require('extend'),
  config = require('../conf');

module.exports = extend(true, config.default, config[process.env.NODE_ENV]);