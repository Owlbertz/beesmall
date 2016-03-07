var config = require('./config'),
  Log = require('./log');

var util = new Object();


util.config = config;

util.log = new Log(config);


module.exports = util;