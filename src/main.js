var _ = require('underscore'),
  async = require('async'),
  color = require('cli-color'),
  config = require('./config.json'),
  dns = require('dns'),
  fs = require('fs'),
  helpers = require('./helpers'),
  pkg = require('../package.json'),
  ProgressBar = require('progress'),
  request = require('request'),
  domainSearch = require('./domainSearch');

module.exports = function (_domains, _options) {
  var logFileName = pkg.name + '_' + new Date().getTime() + '.log',
    logFilePath = process.cwd() + '/' + logFileName,
    options = _options,
    progressBar,
    report = {},
    q;

  q = async.queue(function (_domain, _callback) {
    domainSearch(_domain, options, report, progressBar, _callback);
  }, 1);

  q.drain = function () {
    var logContent = '',
      numUnverified = (options.tlds.length * _domains.length) - (Object.keys(report).length),
      results = {
        available: _.where(report, {
          available: true
        }),
        unavailable: _.where(report, {
          unavailable: true
        }),
        failed: _.where(report, {
          failed: true
        })
      };

    if (!options.verbose) {
      progressBar.tick(10e10);
    }

    console.log('');
    console.log('-------------------------');
    console.log('', color.green(helpers.pad(results.available.length, 7) + ' available'));
    console.log('', helpers.pad(results.unavailable.length, 7) + ' unavailable');
    console.log('', color[results.failed.length > 0 ? 'red' : 'blackBright'](helpers.pad(results.failed.length, 7) + ' failed'));

    if (process.SIGINT) {
      console.log('', color.cyan(helpers.pad(numUnverified, 7) + ' unverified'));
    }

    console.log('-------------------------\n');

    if (!options.nolog) {
      console.log(color.blackBright('Log written to ' + logFilePath), '\n');
    }

    if (!options.nolog) {
      if (process.SIGINT) {
        logContent += '!! Process cancelled. There were ' + numUnverified + ' domains that were not searched !!\n\n';
      }

      ['available', 'unavailable', 'failed'].forEach(function (_status) {
        logContent += '# ' + _status + '\n-------------\n';
        results[_status].forEach(function (_tld) {
          logContent += _tld.domain + (_tld.failed ? '\t' + _.last(_tld.errors) : '') + '\n';
        });
        logContent += '\n\n';
      });

      fs.writeFileSync(logFilePath, logContent, {
        encoding: 'utf8'
      });
    }

    process.exit();

  };

  process.on('SIGINT', function () {
    process.SIGINT = true;
    q.drain();
    q.kill();
  });

  async.waterfall([

    function (_callback) {

      if (Array.isArray(options.realTlds) && options.realTlds.length > 0) return _callback();

      request(config.tldSourceUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          options.realTlds = body.split('\n');
        }

        _callback(error);

      });
    },

    function (_callback) {

      if (options.nolog) return _callback();

      fs.readFile(logFilePath, function (_error) {
        if (!_error) {
          fs.writeFileSync(logFilePath, '', {
            encoding: 'utf8'
          });
        }
        _callback();
      });

    }

  ], function (_error) {
    if (_error) return console.log(_error);

    options.tlds = Array.isArray(options.tlds) && options.tlds.length > 0 ? options.tlds : options.realTlds;

    if (!options.verbose) {
      progressBar = new ProgressBar('searching [:bar] :etas', {
        total: options.tlds.length * _domains.length,
        width: 20,
        clear: true
      });
    } else {
      console.log('');
    }

    _domains.forEach(function (_domain) {
      q.push(_domain);
    });

  });

};