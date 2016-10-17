(function() {

  'use strict';

  const request = require('request'),
    _ = require('lodash'),
    path = require('path'),
    expectation = require('./expectation'),
    response = require('./response')
    ;

  let app = {};

  const processPostback = function(payload, sender) {
    return response.respond(payload, sender);
  };

  const dispatch = function(message, sender) {
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

  const bootstrap = function(config) {
    app.expectation = config.expectation;
    app.token = config.token;
    app.mount = config.mount;
    mount(app.mount);
    return app;
  };

  const mount = function(mountPoint) {
    const libs = require('require-all')(__dirname + '/../../' + mountPoint);
  };

  const handleMessage = function(event, sender) {
    if (event.message && event.message.text && !event.message.is_echo) {
      expectation.process(event.message.text, sender).then(function(res) {
        _.each(res, function(r) {
          dispatch(r, sender);
        });
      }, function(err) {
        console.error(err);
      })
    } else if (event.postback) {
      dispatch(processPostback(event.postback.payload, sender), sender);
    } else if (event.message && event.message.attachments) {
      dispatch(event.message.attachments[0].payload.url, sender);
    }
  };

  module.exports = {
    bootstrap: bootstrap,
    handleMessage: handleMessage
  };

}());
