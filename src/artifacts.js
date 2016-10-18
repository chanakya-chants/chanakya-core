(function() {

  'use strict';

  const _ = require('lodash');

  let artifacts = {
    validators: {},
    responses: {},
    expectations: {},
    responseExpectation: {},
    expectationValidators: {}
  };

  /**
   *
   * @param type
   * @returns {Function}
   */
  function register(type) {
    return function(name, next, body) {
      if (_.isUndefined(artifacts[type][name])) {
        artifacts[type][name] = body;
        if (type === 'responses') {
          artifacts.responseExpectation[name] = next;
        } else if (type === 'expectations') {
          artifacts.expectationValidators[name] = next;
        }
      } else {
        throw new Error(`${type} : ${name} already registered`);
      }
    };
  }

  /**
   *
   * @param type
   * @returns {Function}
   */
  function listArtifacts(type) {
    return function() {
      return _.keys(artifacts[type])
    };
  }

  function getArtifact(type, name) {
    return artifacts[type][name];
  }

  module.exports = {
    register: register,
    list: listArtifacts,
    get: getArtifact
  };
}());
