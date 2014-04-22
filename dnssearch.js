#! /usr/bin/env node

var dns = require('dns'),
  async = require('async'),
  request = require('request'),
  domainName = process.argv[2],
  q,
  free = [],
  errored = [],
  lastErrorCount = 0,
  printResults;

if (process.argv.length !== 3) {
  console.log('usage: dnssearch domain');
  process.exit();
}


var processQueue = function (tld, callback) {
  //Remove comments and blank lines
  if (tld.indexOf('#') === 0 || tld.length === 0) {
    return callback();
  }

  var domain = domainName + '.' + tld;
  domain = domain.toLowerCase();

  dns.resolve4(domain, function (err) {

    if (err && err.code === 'ENOTFOUND') {
      //No domain found. Its free
      console.log(domain + ' is available.\t' + q.length() + ' TLDs to check remaining. ' + errored.length + ' errored.');
      free.push(domain);
      return callback();
    } else if (err) {
      //Error happened so push onto the errored queue to retry later.
      console.log(domain + ' errored. ' + err.code + '\t' + q.length() + ' TLDs to check remaining. ' + errored.length + ' errored.');
      errored.push(tld);
      return callback();
    } else {
      //The domain is taken.
      console.log(domain + ' is taken.\t' + q.length() + ' TLDs to check remaining. ' + errored.length + ' errored.');
      return callback();
    }

  });

};

q = async.queue(processQueue, 10);

console.log('Looking up TLDs from iana.org...');

request('http://data.iana.org/TLD/tlds-alpha-by-domain.txt', function (error, response, body) {
  if (!error && response.statusCode === 200) {
    var lines = body.split('\n');

    q.drain = function () {
      if (errored.length > 0) {
        if (lastErrorCount === errored.length) {
          console.log('Aborting errored TLDs after retrying with no change.');
          printResults();
        } else {
          console.log('Done but with ' + errored.length + ' errors. Retrying errored TLDs', errored);
          q.push(errored);
          lastErrorCount = errored.length;
          errored = [];
        }
      } else {
        console.log('Done.');
        printResults();
      }
    };

    q.push(lines);
  } else {
    console.log('Error looking up TLDs');
  }
});

process.on('SIGINT', function () {
  q.kill();
  console.log('User interrupted process. Here is what we have so far...');
  printResults();
  process.exit();
});

printResults = function () {
  console.log('The available domains are:');
  console.log(free.join('\n'));
};