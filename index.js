var fs = require('fs');
var events = require('events');
var spawn = require('child_process').spawn;
var Twit = require('twit');
var _ = require('underscore');

function Monitor(config) {
  var T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret
  });

  var self = this;

  this.T = T;

  // The events we emit.
  var Event = {
    NewMatchingTweet: 'NewMatchingTweet'
  };

  var eventEmitter = new events.EventEmitter();

  this.newTweet = eventEmitter;

  this.mostRecentTweet = {};

  this.watchTwitter = function watchTwitter(account, pattern, interval) {
    setInterval(function() {
      self.pollTwitter(account, pattern);
    }, interval);
  };

  this.pollTwitter = function pollTwitter(account, pattern) {
    var path = 'statuses/user_timeline';

    var options = {
      'screen_name': account,
      'trim_user': 'true',
      'exclude_replies': 'true'
    };

    // If we've already gotten a list of tweets,
    // we only want to get the ones *after* the one we have stored.
    if (self.mostRecentTweet[account]) {
      options.since_id = self.mostRecentTweet[account];
    }

    T.get(path, options, function(err, data, response) {
      data = self.stripData(data);
      data = self.matchPattern(data, pattern);

      if (data.length > 0) {
        self.newMatchingTweet(account, data[0]);
      }
    });
  };

  this.newMatchingTweet = function newMatchingTweet(account, tweet) {
    var didFindNewerTweet = tweet.id > (self.mostRecentTweet[account] || 0);

    if (didFindNewerTweet) {
      self.mostRecentTweet[account] = tweet.id;

      self.emitNotificationForNewTweet(account, tweet);
    }
  };

  this.stripData = function stripData(data) {
    return _.map(data, function(d) {
        return {text: d.text, id: d.id_str};
      });
  };

  this.matchPattern = function matchPattern(data, pattern) {
    return _.filter(data, function(d) {
      return d.text.match(pattern);
    });
  };

  this.emitNotificationForNewTweet = function emitNotificationForNewTweet(account, tweet) {
    tweet.account = account;
    self.emit(account, tweet);
  };
}

Monitor.prototype = new events.EventEmitter;
Monitor.prototype.start = function(account, pattern, interval) {
  var regex = new RegExp(pattern);
  this.watchTwitter(account, regex, interval);
};

module.exports = Monitor;