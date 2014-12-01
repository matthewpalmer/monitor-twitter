var Monitor = require('monitor-twitter');
var config = require('./config');

var m = new Monitor(config);

m.start('_matthewpalmer', 'http', 30 * 1000);

console.log(m);

m.on('_matthewpalmer', function(tweet) {
  console.log('received a tweet', tweet);
});