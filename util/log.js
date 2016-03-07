var Log = function(config) {
  this.outputPerLevel = {
    info: ['info', 'error'],
    debug: ['info', 'debug', 'error'],
    error: ['error']
  };

  try {
    this.level = config.server.log.level || 'info';
    this.info('Log level is ' + this.level);
  } catch (err) {
    this.level = 'info';
    this.info('Unable to read log config: Using info');
  }

};
Log.prototype.info = function() {
  if (this.outputPerLevel[this.level].indexOf('info') !== -1) {
    this._log('info', arguments);
  }
};
Log.prototype.debug = function() {
  if (this.outputPerLevel[this.level].indexOf('debug') !== -1) {
    this._log('debug', arguments);
  }
};
Log.prototype.error = function() {
  if (this.outputPerLevel[this.level].indexOf('error') !== -1) {
    this._log('error', arguments);
  }
};
Log.prototype._log = function(level, args) {
  if (args.length && args[0] !== '') {
    console.error.apply(console, ['[' + level.toUpperCase() + ']'].concat([].slice.apply(args)));
  }
};

module.exports = Log;