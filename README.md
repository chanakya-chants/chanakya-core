# chanakya-core

**chanakya** is a framework to author chat bots. 

It consists of three parts :

* [core](https://github.com/chanakya-chants/chanakya-core) : the deployment agnostic bot maker.
* platform : a set of plugin to which let you deploy your chat-bot in specific platform. Currently only [facebook](https://developers.facebook.com/docs/messenger-platform) is supported. 
* nlp : a plugin to connect to a given nlp api to parse the text and trigger necessary response by the bot. Currently only [wit.ai](https://wit.ai/) is supported.

## Getting started

1. Create a facebook [page](https://www.facebook.com/pages/create/).
2. Create a facebook [web app](https://developers.facebook.com/quickstarts/?platform=web).
3. Go to your app settings and, under Product Settings, click "Add Product." Select "Messenger."
4. Get page access token as described [here](https://developers.facebook.com/docs/messenger-platform/quickstart#get_page_access_token) and keep a note of it.
5. Clone [chanakya-starter-kit](https://github.com/chanakya-chants/chanakya-starter-kit).
6. Open index.js and put your [token](https://github.com/chanakya-chants/chanakya-starter-kit/blob/master/index.js#L12).
7. Run `npm i`
8. Run `./ngrok http 3000`
9. Open another console and run `node index.js`
10. Setup webhook as described [here](https://developers.facebook.com/docs/messenger-platform/quickstart#setup_webhook). In the callback url give the ngrok https url which will look like `https://708f4702.ngrok.io`. Remember to append `/webhook`. So the final url should look like `https://708f4702.ngrok.io/webhook`. Token should be the above token.
11. Subcribe you app with the page as described [here](https://developers.facebook.com/docs/messenger-platform/quickstart#subscribe_app_page). Do not forget to replace your token.
12. Phew no more steps ... head on to your facebook page, open message dialog and say `hi`. You should get 2 messages back.




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
