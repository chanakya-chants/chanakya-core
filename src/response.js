(function() {

  'use strict';

  const _ = require('lodash'),
    artifacts = require('./artifacts'),
    session = require('./session');

  const register = artifacts.register('responses');

  const listResponses = artifacts.list('responses');

  const respond = function(name, param1, param2) {
    if (_.isUndefined(artifacts.get('responses', name))) {
      throw new Error(name + ' is not a registered response!!! You may want to check for typo as well.');
    } else {
      const nextExpectation = artifacts.get('responseExpectation', name);
      if (_.isUndefined(nextExpectation)) {
        session.setX(param1.id, 'postback');
      } else {
        session.setX(param1.id, nextExpectation);
      }
      return artifacts.get('responses', name).call(this, param1, param2);
    }
  };

  return {
    register: register,
    list: listResponses,
    respond: respond
  }

}());

