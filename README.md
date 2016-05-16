# chanakya-core

**chanakya** is a framework to author chat bots. 

It consists of three parts :

* [core](https://github.com/chanakya-chants/chanakya-core) : the deployment agnostic bot maker.
* platform : a set of plugin to which let you deploy your chat-bot in specific platform. Currently only [facebook](https://developers.facebook.com/docs/messenger-platform) is supported. 
* nlp : a plugin to connect to a given nlp api to parse the text and trigger necessary response by the bot. Currently only [wit.ai](https://wit.ai/) is supported.

## Usage

```javascript
var C = require('chanakya');

C.bootstrap({
  mount: '<folder containing chankya artifacts>',
  expectation: '<entry expectation>',
  token: '<token>'
});
```

### Creating a response

```javascript
core.response('fail', function (to) {
  return {
    text: `I am sorry ${to.first_name}, I am unable to understand what you mean.`
  };
}, 'greetings');
```

### Creating a expectation

```javascript
core.expectation('greetings', function () {
  return {
    validators : ['isGreetings'],
    success : ['start'],
    fail: ['fail']
  };
});
```

### Creating a validator

```javascript
core.validator('isGreetings', function (message) {
  return Q.fcall(function () {
    return message == 'hi';
  });
});
```
