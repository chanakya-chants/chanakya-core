/**
 * Created by suman on 10/05/16.
 */

(function() {

  'use strict';

  const session = require('./src/session'),
    response = require('./src/response'),
    validator = require('./src/validator'),
    expectation = require('./src/expectation'),
    app = require('./src/app');

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
