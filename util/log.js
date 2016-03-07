var chalk = require('chalk');

/**
 * Provides object to handle logging.
 * @param {Object} config - Configuration.
 */
var Log = function(config) {
  this.outputPerLevel = {
    info: ['info', 'error'],
    debug: ['info', 'debug', 'error'],
    error: ['error']
  };

  try {
    this.level = config.server.log.level || 'info';
  } catch (err) {
    this.level = 'info';
    this.info('Unable to read log config: Using info');
  }

};
/**
 * Logs on info level. Takes any parameter using `arguments` and passes them to `_log`.
 */
Log.prototype.info = function() {
  if (this.outputPerLevel[this.level].indexOf('info') !== -1) {
    this._log(chalk.green('[INFO]'), arguments);
  }
};
/**
 * Logs on debug level. Takes any parameter using `arguments` and passes them to `_log`.
 */
Log.prototype.debug = function() {
  if (this.outputPerLevel[this.level].indexOf('debug') !== -1) {
    this._log(chalk.blue('[DEBUG]'), arguments);
  }
};
/**
 * Logs on error level. Takes any parameter using `arguments` and passes them to `_log`.
 */
Log.prototype.error = function() {
  if (this.outputPerLevel[this.level].indexOf('error') !== -1) {
    this._log(chalk.red('[ERROR]'), arguments);
  }
};
/**
 * Writes a new line.
 * @return {Object} this - the Log itself for method chaining.
 */
Log.prototype.nl = function() {
  console.log('\n');
  return this;
};
/**
 * Writes to the console.
 * @param {String} level - Level to be prepended.
 * @param {Object} args - Object of arguments passed to the public methods using `arguments`.
 */
Log.prototype._log = function(level, args) {
  if (args.length && args[0] !== '') {
    console.log.apply(console, [level].concat([].slice.apply(args)));
  }
};

module.exports = Log;