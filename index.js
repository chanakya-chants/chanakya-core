/**
 * Created by suman on 10/05/16.
 */

(function() {

  'use strict';

  const session = require('./lib/session'),
    response = require('./lib/response'),
    validator = require('./lib/validator'),
    expectation = require('./lib/expectation'),
    app = require('./lib/app');

  module.exports = {
    session: {
      get: session.get,
      set: session.set
    },
    bootstrap: app.bootstrap,
    handleMessage: app.handleMessage,
    response: response.register,
    validator: validator.register,
    expectation: expectation.register
  };

}());
