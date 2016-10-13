/**
 * Created by suman on 10/05/16.
 */

(function() {

  'use strict';

  const request = require('request'),
    _ = require('lodash'),
    Q = require('q'),
    path = require('path');

  let core = {}, app = {}, chatSession = {},
    artifacts = {
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

  /**
   *
   * @param type
   * @returns {Function}
   */
  function invoke(type) {
    return function(name, param1, param2) {
      if (_.isUndefined(artifacts[type][name])) {
        throw new Error(name + ' is not a registered ' + type + '!!! You may want to check for typo as well.');
      } else {
        if (type === 'responses') {
          if (_.isUndefined(artifacts.responseExpectation[name])) {
            chatSession[param1.id].expectation = 'postback';
          } else {
            chatSession[param1.id].expectation = artifacts.responseExpectation[name];
          }
        }
        return artifacts[type][name].call(this, param1, param2);
      }
    };
  }

  /**
   * Validators
   */

  core.validator = register('validators');

  core.getAllValidators = listArtifacts('validators');

  core.validate = function(name, param1, param2) {
    if (_.isUndefined(artifacts.validators[name])) {
      throw new Error(name + ' is not a registered response!!! You may want to check for typo as well.');
    } else {
      return artifacts.validators[name].call(this, param1, param2);
    }
  };

  /**
   * Responses
   */

  core.response = register('responses');

  core.getAllResponses = listArtifacts('responses');

  core.respond = function(name, param1, param2) {
    if (_.isUndefined(artifacts.responses[name])) {
      throw new Error(name + ' is not a registered response!!! You may want to check for typo as well.');
    } else {
      if (_.isUndefined(artifacts.responseExpectation[name])) {
        chatSession[param1.id].expectation = 'postback';
      } else {
        chatSession[param1.id].expectation = artifacts.responseExpectation[name];
      }
      return artifacts.responses[name].call(this, param1, param2);
    }
  };

  /**
   * Expectations
   */

  core.expectation = register('expectations');

  core.getAllExpectations = listArtifacts('expectations');

  function _createResponse(expectation, res) {
    var outcome = artifacts.expectations[expectation].call(this, res);
    var responses = [];
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
  }

  /**
   *
   * @param expectation
   * @param payload
   * @param sender
   * @returns {Promise.<TResult>}
   */
  core.expect = function(expectation, payload, sender) {
    var validationResult = core.validate(artifacts.expectationValidators[expectation][0], payload);
    return validationResult
      .then(function(res) {
        return _.isUndefined(res.json) ? res : res.json();
      }).then(function(res) {
        return _createResponse(expectation, res);
      });
  };

  /**
   * Process Expectation
   * @param payload
   */
  core.processExpectation = function(payload, sender) {
    if (chatSession[sender.id].expectation !== 'postback') {
      return core.expect(chatSession[sender.id].expectation, payload, sender).then(
        function(res) {
          var responses = [];
          _.each(res, function(responseObj) {
            responses.push(core.respond(responseObj.name, sender, responseObj.data));
          });

          return responses;
        }, function(err) {
          return err;
        }
      );
    } else {
      return Q.fcall(function() {
        return [core.respond('doPostback', sender), sender, null];
      });
    }
  };

  /**
   * Process Postback
   * @param payload
   * @param sender
   * @returns {*}
   */
  core.processPostback = function(payload, sender) {
    return core.respond(payload, sender);
  };

  /**
   *
   * @param message
   * @param sender
   */
  var dispatch = function(message, sender) {
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: app.token },
      method: 'POST',
      json: {
        recipient: { id: sender.id },
        message: message
      }
    }, function(error, response, body) {
      if (error) {
        throw new Error('Error sending message: ', error);
      }
    });
  };

  /**
   *
   * @param config
   * @returns {{}}
   */
  core.bootstrap = function(config) {
    app.expectation = config.expectation;
    app.token = config.token;
    app.mount = config.mount;
    core.mount(app.mount);
    return app;
  };

  /**
   *
   * @returns {string|*|string}
   */
  core.getExpectation = function() {
    return app.expectation;
  };

  /**
   *
   * @param mountPoint
   */
  core.mount = function(mountPoint) {
    var libs = require('require-all')(__dirname + '/../../' + mountPoint);
  };

  /**
   *
   * @param event
   * @param sender
   */
  core.handleMessage = function(event, sender) {
    if (event.message && event.message.text && !event.message.is_echo) {
      core.processExpectation(event.message.text, sender).then(function(res) {
        _.each(res, function(r) {
          dispatch(r, sender);
        });
      }, function(err) {
        console.error(err);
      })
    } else if (event.postback) {
      dispatch(core.processPostback(event.postback.payload, sender), sender);
    } else if (event.message && event.message.attachments) {
      dispatch(event.message.attachments[0].payload.url, sender);
    }
  };

  /**
   * return session data from in-memory session map
   * @param id
   * @returns {*}
   */
  core.getSession = function(id) {
    return chatSession[id];
  };

  /**
   * set session data from in-memory session map
   * @param sessionData
   */
  core.setSession = function(sessionData) {
    chatSession[sessionData.id] = sessionData;
  };

  module.exports = core;

}());
