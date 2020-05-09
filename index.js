const events = require('events');
const Twit = require('twit');
const _ = require('underscore');

class Monitor extends events.EventEmitter{
  /**
   * @param {{consumer_key: string, consumer_secret: string, access_token: string, access_token_secret: string}} config
    */
  constructor(config){
    this.T = new Twit({
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
      access_token: config.access_token,
      access_token_secret: config.access_token_secret,
    });
    this._mostRecentTweet = {};
  }

  /**
   * @param {string} account 
   * @param {string} pattern regex
   * @param {number} interval milliseconds
   */
  watchTwitter(account, pattern, interval) {
    setInterval(() => {
      this._pollTwitter(account, pattern);
    }, interval);
  };

  /**
   * @param {string} account 
   * @param {string} pattern regex
   */
  _pollTwitter(account, pattern) {
    const path = 'statuses/user_timeline';

    const options = {
      'screen_name': account,
      'trim_user': 'true',
      'exclude_replies': 'true'
    };

    // If we've already gotten a list of tweets,
    // we only want to get the ones *after* the one we have stored.
    if (this._mostRecentTweet[account]) {
      options.since_id = this._mostRecentTweet[account];
    }

    this.T.get(path, options, (err, data, response) => {
      data = this._stripData(data);
      data = this._matchPattern(data, pattern);

      if (data.length > 0) {
        this._newMatchingTweet(account, data[0]);
      }
    });
  };

  /**
   * @param {string} account 
   * @param {*} tweet 
   */
  _newMatchingTweet(account, tweet) {
    if (tweet.id > (this._mostRecentTweet[account] || 0)) {
      this._mostRecentTweet[account] = tweet.id;
      this._emitNotificationForNewTweet(account, tweet);
    }
  };

  _stripData(data) {
    return _.map(data, function(d) {
        return {text: d.text, id: d.id_str};
      });
  };

  /**
   * @param {[{text:string}]} data 
   * @param {string} pattern regex
   */
  _matchPattern(data, pattern) {
    return _.filter(data, function(d) {
      return d.text.match(pattern);
    });
  };

  /**
   * @param {string} account 
   * @param {*} tweet 
   */
  _emitNotificationForNewTweet(account, tweet) {
    tweet.account = account;
    this.emit(account, tweet);
  };

  /**
   * @param {string} account 
   * @param {string} pattern regex
   * @param {number} interval milliseconds
   */
  start(account, pattern, interval) {
    const regex = new RegExp(pattern);
    this.watchTwitter(account, regex, interval);
  };
}

module.exports = Monitor;