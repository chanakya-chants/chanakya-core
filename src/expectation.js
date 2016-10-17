(function() {

  'use strict';
  const _ = require('lodash'),
    artifacts = require('./artifacts'),
    validator = require('./validator'),
    response = require('./response'),
    session = require('./session');

  const register = artifacts.register('expectations');

  const listExpectations = artifacts.list('expectations');

  const _createResponse = function(name, res) {
    let outcome = artifacts.get('expectations', name).call(this, res);
    let responses = [];
    if (_.isPlainObject(outcome)) {
      responses = _.map(outcome.responses, function(response) {
        return {
          data: outcome.data,
          name: response
        };
      })
    } else if (_.isArray(outcome)) {
      responses = _.map(outcome, function(response) {
        return {
          data: null,
          name: response
        };
      });
    } else {
      responses = _.map(['fail'], function(response) {
        return {
          data: null,
          name: response
        };
      });
    }

    return Q.fcall(function() {
      return responses;
    });
  };

  const expect = function(expectation, payload) {
    const validationResult = validator.validate(artifacts.get('expectationValidators', expectation)[0], payload);
    return validationResult
      .then(function(res) {
        return _.isUndefined(res.json) ? res : res.json();
      }).then(function(res) {
        return _createResponse(expectation, res);
      });
  };

  const processExpectation = function(payload, sender) {
    if (session.getX(sender.id) !== 'postback') {
      return core.expect(chatSession[sender.id].expectation, payload, sender).then(
        function(res) {
          let responses = [];
          _.each(res, function(responseObj) {
            responses.push(response.respond(responseObj.name, sender, responseObj.data));
          });

          return responses;
        }, function(err) {
          return err;
        }
      );
    } else {
      return Q.fcall(function() {
        return response.respond('fail', sender);
      });
    }
  };

  module.exports = {
    register: register,
    list: listExpectations,
    expect: expect,
    process: processExpectation
  };

}());

