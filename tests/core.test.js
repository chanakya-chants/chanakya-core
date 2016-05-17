var chai = require('chai');
var expect = chai.expect;
var core = require('./../index.js');

describe('register artifact', function () {
  it('should register a response', function () {
    core.response('success', function () {
      return 'success';
    });
    expect(core.getAllResponses().length).to.equal(1);
  });
  it('should register a validator', function () {
    core.validator('isGreetings', function (message) {
      return message === 'hi';
    });
    expect(core.getAllValidators().length).to.equal(1);
  });

  it('should register a expectation', function () {
    core.expectation('phoneno', function () {
      return {
        validators: ['isPhoneno'],
        success: ['success'],
        fail: ['fail']
      };
    }, 'greetings');
    expect(core.getAllExpectations().length).to.equal(1);
  })
});
