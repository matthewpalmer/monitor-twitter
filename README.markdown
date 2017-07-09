# monitor-twitter
> A Node.js module to monitor Twitter for tweets from a user that match a pattern.

## Install

`npm install monitor-twitter`

Note: this gets the id_str not the id. id_str is what's used to identify tweets. See this: 
https://dev.twitter.com/overview/api/twitter-ids-json-and-snowflake


## Example

```js
var Monitor = require('monitor-twitter');

// Your Twitter credentials
var config = {
  consumer_key: KEY,
  consumer_secret: SECRET,
  access_token: TOKEN,
  access_token_secret: TOKEN_SECRET 
};

var m = new Monitor(config);

// Watch the account '_matthewpalmer' for Tweets containing 'http' every 30 seconds.
m.start('_matthewpalmer', 'http', 30 * 1000);

m.on('_matthewpalmer', function(tweet) {
  console.log('Received a tweet', tweet);
});
```
