const fs = require('fs');
const events = require('events');
const Twit = require('twit');
const _ = require('underscore');

class Monitor extends events.EventEmitter{
  constructor(config){
    this.T = new Twit({
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
      access_token: config.access_token,
      access_token_secret: config.access_token_secret,
    });
    this.newTweet = new events.EventEmitter();
    this.mostRecentTweet = {};
  }

  watchTwitter(account, pattern, interval) {
    setInterval(() => {
      this.pollTwitter(account, pattern);
    }, interval);
  };

  pollTwitter(account, pattern) {
    const path = 'statuses/user_timeline';

    const options = {
      'screen_name': account,
      'trim_user': 'true',
      'exclude_replies': 'true'
    };

    // If we've already gotten a list of tweets,
    // we only want to get the ones *after* the one we have stored.
    if (this.mostRecentTweet[account]) {
      options.since_id = this.mostRecentTweet[account];
    }

    this.T.get(path, options, (err, data, response) => {
      data = this.stripData(data);
      data = this.matchPattern(data, pattern);

      if (data.length > 0) {
        this.newMatchingTweet(account, data[0]);
      }
    });
  };

  newMatchingTweet(account, tweet) {
    if (tweet.id > (this.mostRecentTweet[account] || 0)) {
      this.mostRecentTweet[account] = tweet.id;
      this.emitNotificationForNewTweet(account, tweet);
    }
  };

  stripData(data) {
    return _.map(data, function(d) {
        return {text: d.text, id: d.id_str};
      });
  };

  matchPattern(data, pattern) {
    return _.filter(data, function(d) {
      return d.text.match(pattern);
    });
  };

  emitNotificationForNewTweet(account, tweet) {
    tweet.account = account;
    this.emit(account, tweet);
  };

  start(account, pattern, interval) {
    const regex = new RegExp(pattern);
    this.watchTwitter(account, regex, interval);
  };
}

module.exports = Monitor;