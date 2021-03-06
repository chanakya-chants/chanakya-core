(function() {

  'use strict';
  var redis = require("redis");
  var bluebird = require("bluebird");

  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);

  // redis.debug_mode = true;

  var client = redis.createClient(process.env.REDIS_URL);

  client.on("error", function(err) {
    console.log("Error " + err);
  });

  // let chatSession = {};

  const getSession = function(id) {
    return client.hgetallAsync(id);
    // return chatSession[id];
  };

  const setSession = function(sessionData) {
    client.HMSET(sessionData.id, sessionData);
    // chatSession[sessionData.id] = sessionData;
  };

  const setExpectation = function(id, expectation) {
    client.hdelAsync(id, 'expectation').then(function() {
      client.hsetAsync(id, 'expectation', expectation);
    });
    // chatSession[id].expectation = expectation;
  };

  module.exports = {
    get: getSession,
    set: setSession,
    setX: setExpectation
  }

}());
