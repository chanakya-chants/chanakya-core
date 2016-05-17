/**
 * Created by suman on 10/05/16.
 */

(function () {

  var clc = require("cli-color"),
    request = require('request'),
    _ = require('lodash'),
    https = require('https'),
    Q = require('q'),
    path = require('path'),
    ra = require('require-all');

  var core = {}, app = {}, chatSession = {};

  var artifacts = {
    validators: {},
    responses: {},
    expectations: {},
    responseExpectation: {}
  };

  function register(type) {
    return function (name, body, next) {
      if (_.isUndefined(artifacts[type][name])) {
        artifacts[type][name] = body;
        if (!_.isUndefined(next) && type === 'responses') {
          artifacts.responseExpectation[name] = next;
        }
      } else {
        console.error(clc.red(type + ' : ' + name + ' already registered'));
      }
    };
  }

  function listArtifacts(type) {
    return function () {
      return _.keys(artifacts[type])
    };
  }

  function invoke(type) {
    return function (name, params) {
      if (_.isUndefined(artifacts[type][name])) {
        console.error(clc.red(name + ' is not a registered ' + type + '!!! You may want to check for typo as well.'));
      } else {
        if (type === 'responses') {
          if (_.isUndefined(artifacts.responseExpectation[name])) {
            chatSession[params.id].expectation = 'postback';
          } else {
            chatSession[params.id].expectation = artifacts.responseExpectation[name];
          }
        }

        return artifacts[type][name].call(this, params)
      }
    };
  }

  /**
   * Validators
   */

  core.validator = register('validators');

  core.getAllValidators = listArtifacts('validators');

  core.validate = invoke('validators');

  /**
   * Responses
   */

  core.response = register('responses');

  core.getAllResponses = listArtifacts('responses');

  core.respond = invoke('responses');

  /**
   * Expectations
   */

  core.expectation = register('expectations');

  core.getAllExpectations = listArtifacts('expectations');

  core.expect = function (expectation, payload, sender) {
    var foo = artifacts.expectations[expectation].call(this, payload);
    var validationResult = core.validate(foo.validators[0], payload);
    return validationResult.then(function (res) {
      if (res) {
        return Q.fcall(function () {
          if (_.isString(res)) {
            foo.success.push(res);
          }
          return core.respond(foo.success[0], sender, payload);
        });
      } else {
        return Q.fcall(function () {
          return core.respond(foo.fail[0], sender);
        });
      }
    }, function (err) {
      console.log(err);
    });
  };

  /**
   * Process Expectation
   * @param payload
   */
  core.processExpectation = function (payload, sender) {
    if (chatSession[sender.id].expectation !== 'postback') {
      return core.expect(chatSession[sender.id].expectation, payload, sender).then(
        function (res) {
          return res;
        }, function (err) {
          return err;
        }
      );
    } else {
      return Q.fcall(function () {
        return core.respond('fail', sender);
      });
    }
  };

  /**
   * Process Postback
   * @param payload
   * @param sender
   * @returns {*}
   */
  core.processPostback = function (payload, sender) {
    // return chatSession[sender.id].expectation === 'postback' ? core.respond(payload, sender) : core.respond('fail', sender);
    return core.respond(payload, sender);
  };

  core.dispatch = function (message, sender) {
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: app.token},
      method: 'POST',
      json: {
        recipient: {id: sender.id},
        message: message,
      }
    }, function (error, response) {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  };

  core.bootstrap = function (config) {
    app.expectation = config.expectation;
    app.token = config.token;
    app.mount = config.mount;
    mount(app.mount);
    return app;
  };

  core.getExpectation = function () {
    return app.expectation;
  };

  var mount = function (mountPoint) {
    var libs = ra(__dirname + '/../../' + mountPoint);
  };

  core.handleMessage = function (event, sender) {
    if (event.message && event.message.text) {
      core.processExpectation(event.message.text, sender).then(function (res) {
        core.dispatch(res, sender);
      }, function (err) {
        console.log(err);
      })
    } else if (event.postback) {
      core.dispatch(core.processPostback(event.postback.payload, sender), sender);
    } else if (event.message && event.message.attachments) {
      core.dispatch(event.message.attachments[0].payload.url, sender);
    }
  };

  core.getSession = function (id) {
    return chatSession[id];
  };

  core.setSession = function (sessionData) {
    chatSession[sessionData.id] = sessionData;
  };

  module.exports = core;

}());
