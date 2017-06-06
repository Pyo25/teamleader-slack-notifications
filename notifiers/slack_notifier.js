
const Slack = require('slack-node');

const config = require('../config');

class SlackNotifier {

  /**
   * @param {Object} [params] A set of optional parameters
   * @param {String} [params.channel] Channel name
   * @param {String} [params.username] Username
   * @param {String} [params.iconEmoji] URL of the user emoji
   */
  constructor(params) {
    params = params || {};
    this.client = new Slack();
    this.client.setWebhook(config.slack.incomingWebhook);
    this.defaultChannel = params.channel || config.slack.channel || '#general';
    this.defaultUsername = params.username || config.slack.username || 'Teamleader';
    this.defaultIconEmoji = params.iconEmoji || config.slack.iconEmoji;
  }

  /**
   * @param {String} msg The text to post to the channel
   * @param {Object} [params] A set of optional parameters
   * @param {String} [params.channel] Channel name
   * @param {String} [params.username] Username
   * @param {String} [params.iconEmoji] URL of the user emoji
   * @returns {Promise}
   */
  notify(msg, params) {
    if (!msg) { throw new Error('Message is required'); }
    params = params || {};
    return new Promise((resolve, reject) => {
      this.client.webhook({
        channel: params.channel || this.defaultChannel,
        username: params.username || this.defaultUsername,
        icon_emoji: params.iconEmoji || this.defaultIconEmoji,
        text: msg,
      }, (err, response) => {
        if (err) { return reject(err); }
        return resolve(response);
      });
    });
  }
}

module.exports = SlackNotifier;
