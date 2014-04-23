var _ = require('underscore'),
  cast = require('sc-cast');

exports.pad = function (_value, _padBy, _options) {
  var value = cast(_value, 'string', ''),
    options = _.extend({
      padCharacter: ' '
    }, _options);

  while (value.length < _padBy) {
    value = options.padCharacter + value;
  }

  return value;
};

exports.list = function (val) {
  return val.trim().split(/[^\w]*,[^\w]*/);
};