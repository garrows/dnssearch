var _ = require('underscore'),
  async = require('async'),
  color = require('cli-color'),
  dns = require('dns');

module.exports = function (_domain, _options, _report, _progressBar, _callback) {
  var q = async.queue(function (_tld, _callback) {
    var domain = _domain + '.' + _tld;

    //Remove comments and blank lines
    if (_tld.indexOf('#') === 0 || _tld.length === 0) {
      return _callback();
    }

    domain = domain.toLowerCase();

    dns.resolve4(domain, function (_error) {
      if (process.SIGINT) return;

      var eNotFound = _error && _error.code === 'ENOTFOUND',
        invalidTld = _.contains(_options.realTlds, _tld.toUpperCase()) === false,
        error = eNotFound && !invalidTld ? null : _error ? _error : invalidTld ? new Error('`' + _tld + '` tld is invalid') : null,
        domainReport = _report[domain] = _report[domain] || {};

      domainReport.domain = domain;
      domainReport.available = !error && eNotFound;
      domainReport.errors = domainReport.errors || [];
      domainReport.unavailable = !error && !domainReport.available;

      if (!error && domainReport.available) {
        if (_options.verbose) console.log(color.green(' ✔︎  ') + domain);
      } else if (!error && !domainReport.available) {
        if (_options.verbose) console.log(color.blackBright('  ︎  ' + domain + ' is unavailable'));
      } else if (error) {
        domainReport.errors.push(error);
        if (domainReport.errors.length < 2) {
          q.push(_tld);
        } else {
          domainReport.failed = true;
          if (_options.verbose) console.log(color.red(' ✖︎  ' + domain + ' errored and could not be checked'));
        }
      }

      if ((!error || domainReport.failed) && !_options.verbose) {
        _progressBar.tick();
      }

      _callback();

    });

  }, 10);

  q.drain = function () {
    _callback();
  }

  process.on('SIGINT', function () {
    process.SIGINT = true;
    q.kill();
  });

  _options.tlds.forEach(function (_tld) {
    q.push(_tld);
  });

};