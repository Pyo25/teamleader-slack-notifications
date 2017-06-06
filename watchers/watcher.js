
const config = require('../config');
const Teamleader = require('teamleader');
const SlackNotifier = require('../notifiers/slack_notifier');

class Watcher {

  constructor() {
    this.tl = new Teamleader({
      group: config.teamleader.group,
      api_secret: config.teamleader.apiSecret,
    });
    this.initialized = false;
    this.interval = config.defaultInterval || 60000;
    this.currency = config.teamleader.currency || '$';
    this.notifier = new SlackNotifier();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    return Promise.resolve(this);
  }

  getDeal(id) {
    return new Promise((resolve, reject) => {
      this.tl.post('getDeal', {
        deal_id: id,
      }, (err, deal) => {
        if (err) { return reject(err); }
        return resolve(deal);
      });
    });
  }

  getUsers() {
    return new Promise((resolve, reject) => {
      this.tl.post('getUsers', {
        amount: 100,
        pageno: 1,
      }, (err, users) => {
        if (err) { return reject(err); }
        return resolve(users);
      });
    });
  }

  getDealPhases() {
    return new Promise((resolve, reject) => {
      this.tl.post('getDealPhases', {}, (err, phases) => {
        if (err) { return reject(err); }
        return resolve(phases);
      });
    });
  }

  static dateToString(date) {
    let d = date.getDate();
    d = (d <= 9 ? `0${d}` : d);
    let m = date.getMonth() + 1;
    m = m <= 9 ? `0${m}` : m;
    const y = date.getFullYear();

    return `${d}/${m}/${y}`;
  }
}

module.exports = Watcher;
