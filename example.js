const Monitor = require('monitor-twitter');
const config = require('./config');

const m = new Monitor(config);

m.start('_matthewpalmer', 'http', 30 * 1000);

console.log(m);

m.on('_matthewpalmer', (tweet) => {
  console.log('received a tweet', tweet);
});