(function() {

  'use strict';

  let chatSession = {};

  /**
   * return session data from in-memory session map
   * @param id
   * @returns {*}
   */
  const getSession = function(id) {
    return chatSession[id];
  };

  /**
   * set session data from in-memory session map
   * @param sessionData
   */
  const setSession = function(sessionData) {
    chatSession[sessionData.id] = sessionData;
  };

  const setExpectation = function(id, expectation) {
    chatSession[id].expectation = expectation;
  };

  const getExpectation = function(id) {
    return chatSession[id].expectation;
  };

  module.exports = {
    get: getSession,
    set: setSession,
    setX: setExpectation,
    getX: getExpectation
  }

}());
