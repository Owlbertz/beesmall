var config = require('./util/config'),
  Log = require('./util/log');

var util = new Object();


util.config = config;

util.log = new Log(config);


module.exports = util;