(function() {

  'use strict';
  const _ = require('lodash'),
    artifacts = require('./artifacts'),
    validator = require('./validator'),
    response = require('./response'),
    session = require('./session'),
    Q = require('q');

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

  const expect = function(expectation, payload, sender) {
    const validationResult = validator.validate(artifacts.get('expectationValidators', expectation)[0], payload, sender);
    var then = validationResult.then;
    if (typeof then === 'function') {
      return validationResult
        .then(function(res) {
          if (_.isUndefined(res.json)) {
            _updateSession(sender, expectation, res);
            return res;
          } else {
            return res.json();
          }
        }).then(function(res) {
          _updateSession(sender, expectation, res);
          return _createResponse(expectation, res);
        });
    } else {
      return _createResponse(expectation, validationResult);
    }
  };

  function _updateSession(sender, expectation, value) {
    session.get(sender.id.toString()).then(function(res) {
      let thisSession = _.clone(res);
      thisSession[expectation] = JSON.stringify(value);
      session.set(thisSession);
    });
  }

  const processExpectation = function(payload, sender, isExpectation) {
    return session.get(sender.id).then(function(currentSession) {
      if (currentSession.expectation !== 'postback') {
        let expectation = (isExpectation) ? payload : currentSession.expectation
        return expect(expectation, payload, sender).then(
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
    });

  };

  module.exports = {
    register: register,
    list: listExpectations,
    expect: expect,
    process: processExpectation
  };

}());

