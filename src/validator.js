(function() {

  'use strict';

  const _ = require('lodash'),
    artifacts = require('./artifacts');

  const register = artifacts.register('validators');

  const listValidators = artifacts.list('validators');

  const validate = function(name, messageToValidate, sender) {
    if (_.isUndefined(artifacts.get('validators', name))) {
      throw new Error(name + ' is not a registered response!!! You may want to check for typo as well.');
    } else {
      return artifacts.get('validators', name).call(this, messageToValidate, sender);
    }
  };

  module.exports = {
    register: register,
    listValidators: listValidators,
    validate: validate
  };

}());
