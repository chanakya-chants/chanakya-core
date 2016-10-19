(function() {

  'use strict';
  var redis = require("redis");
  var bluebird = require("bluebird");

  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);

  var client = redis.createClient();

  client.on("error", function (err) {
    console.log("Error " + err);
  });

  let chatSession = {};

  /**
   * return session data from in-memory session map
   * @param id
   * @returns {*}
   */
  const getSession = function(id) {
    return client.hgetallAsync(id)
    // return chatSession[id];
  };

  /**
   * set session data from in-memory session map
   * @param sessionData
   */
  const setSession = function(sessionData) {
    console.log(sessionData);
    client.HMSET(sessionData.id, sessionData);
    // chatSession[sessionData.id] = sessionData;
  };

  const setExpectation = function(id, expectation) {
    console.log(arguments);
    client.hmset(id, 'expectation', expectation)
    // chatSession[id].expectation = expectation;
  };



  module.exports = {
    get: getSession,
    set: setSession,
    setX: setExpectation
  }

}());
