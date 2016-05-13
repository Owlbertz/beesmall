var extend = require('extend'),
  config = require('./config'),
  Log = require('./log');

var util = new Object();


util.config = config;
util.setConfig = function(config) {
  this.config = extend(true, this.config, config);
};


util.log = new Log(config);


module.exports = util;