# chanakya-core

![Chanakya logo](https://raw.githubusercontent.com/chanakya-chants/chanakya-core/master/Chanakya_logo.jpg)

Thanks **Sachin Pol** for the logo.

**chanakya** is a framework to author chat bots. 

It consists of three parts :

* [core](https://github.com/chanakya-chants/chanakya-core) : the deployment agnostic bot maker.
* platform : a set of plugin to which let you deploy your chat-bot in specific platform. Currently only [facebook](https://developers.facebook.com/docs/messenger-platform) is supported. 
* nlp : a plugin to connect to a given nlp api to parse the text and trigger necessary response by the bot. Currently only [wit.ai](https://wit.ai/) is supported.

## Getting started

1. Create a facebook [page](https://www.facebook.com/pages/create/).
2. Create a facebook [web app](https://developers.facebook.com/quickstarts/?platform=web).
3. Go to your app settings and, under Product Settings, click "Add Product." Select "Messenger." *For old version of developer console you should be able to click on messenger tab directly*
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

### Application bootstrap

We would need

#### index.js
```javascript
var C = require('chanakya'),
  Cfb = require('chanakya-facebook');

var bot = C.bootstrap({
  mount: '<folder containing chankya artifacts>',
  expectation: '<entry expectation>',
  token: '<token>'
});

Cfb.init(bot);
```

### Creating a response

`chanakya.response` takes 3 parameters
* response name (String)
* followup expectation state (String)
* response creation method (Function). It have two parameters which get injected:
  * `to` contains the sender detail
  * `validatorResult` contains the result form the validator. You can use these two parameters to personalise or customize the response. 

```javascript
chanakya.response('fail', 'greetings', function (to, validatorResult) {
  return {
    text: `I am sorry ${to.first_name}, I am unable to understand what you mean.`
  };
});
```

### Creating a expectation

`chanakya.expectation` also takes 3 parameters 
* expectation name (String)
* validators list (Array) *Although it's an array for now it will accept only one validator name*
* expectation rules (Function)

After the expectation receives a `message` from chat window is pass on the message to the validator `isGreetings` in this case and the result is injected into the 3rd paramter function, `res` in this case.

```javascript
chanakya.expectation('greetings', ['isGreetings'], function (res) {
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

```

### Creating a validator

`chanakya.validator` also takes 3 parameters 
* validator name (String)
* blank parameter (null)
* Validation rules (Function)

Validator should always return a `Promise`. We are using `Q` to make a promise here.

```javascript
core.validator('isGreetings', null, function (message) {
  return Q.fcall(function () {
    return message == 'hi';
  });
});
```

## Contributing

## License 

The MIT License (MIT)

Copyright (c) 2016 Suman Paul

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
