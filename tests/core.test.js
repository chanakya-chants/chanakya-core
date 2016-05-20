(function () {
  'use strict';

  var chai = require('chai');
  var expect = chai.expect;
  var sinon = require('sinon');
  var rewire = require('rewire');
  var core = rewire('./../index.js');

  describe('register artifact', function () {
    it('should register a response', function () {
      core.expectation('greetings', ['isGreetings'], function (res) {
        switch (res) {
          case true:
            return {
              data: res,
              responses: ['fail', 'success']
            };
            break;
          case false:
            return ['fail'];
            break;
        }
      });
      expect(core.getAllExpectations().length).to.equal(1);
    });
    it('should not re-register a response but throw an error', function () {
      expect(() => core.expectation('greetings', ['isGreetings'], function (res) {
        switch (res) {
          case true:
            return {
              data: res,
              responses: ['fail', 'success']
            };
            break;
          case false:
            return ['fail'];
            break;
        }
      })).to.throw('expectations : greetings already registered');
    });
    it('should register a validator', function () {
      core.validator('isGreetings', null, function (message) {
        return Q.fcall(function () {
          return message == 'hi';
        });
      });
      expect(core.getAllValidators().length).to.equal(1);
    });
    it('should register a expectation', function () {
      core.response('fail', 'greetings', function (to, validatorResult) {
        return {
          text: `I am sorry ${to.first_name}, I am unable to understand what you mean. ${validatorResult}`
        };
      });
      expect(core.getAllResponses().length).to.equal(1);
    });
  });

  describe('app bootstrap', function () {
    var mount;
    beforeEach(function () {
      mount = sinon.stub(core, 'mount', function () {
      });
    });

    afterEach(function () {
      mount.restore();
    });
    it('should bootstrap the app and return a valid app', function () {

      expect(core.bootstrap({
        mount: 'bot',
        expectation: 'greetings',
        token: 'token'
      })).to.eql(
        {
          mount: 'bot',
          expectation: 'greetings',
          token: 'token'
        }
      );
    });
  });

  describe('session management', function () {
    it('should set session', function () {
      core.setSession({id: 1234});
      expect(core.getSession('1234')).to.eql({id: 1234});
    });
  });

  describe('expectations', function () {
    var mount;
    beforeEach(function () {
      mount = sinon.stub(core, 'mount', function () {
      });
    });

    afterEach(function () {
      mount.restore();
    });
    it('should return the app current expectation', function () {
      core.bootstrap({
        mount: 'bot',
        expectation: 'greetings',
        token: 'token'
      });

      expect(core.getExpectation()).to.equal('greetings');
    })
  });

}());

