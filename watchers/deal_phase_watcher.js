
const fs = require('fs');
const he = require('he');
const path = require('path');
const sequence = require('promise-sequence');

const Watcher = require('./watcher');

class DealPhaseWatcher extends Watcher {

  constructor(...args) {
    super(args);
    this.users = null;
    this.dealPhases = null;
    this.dataFileName = 'deal_phase_watcher';
    this.alreadyNotifiedChanges = {};
  }

  initialize() {
    if (this.initialized) { console.log('already initialized!'); return Promise.resolve(this); }
    return this.loadUsers()
      .then(this.loadDealPhases.bind(this))
      .then(() => {
        this.initialized = true;
        return this;
      });
  }

  start() {
    if (!this.initialized) { throw new Error('watcher not initialized'); }
    this.intervalId = setInterval(this.checkDealPhaseChanges.bind(this), this.interval);
    this.checkDealPhaseChanges();
    return Promise.resolve(this);
  }

  checkDealPhaseChanges() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    console.log('checking deal phase changes...');

    return this.loadNotifiedChanges(today, tomorrow)
      .then(this.getAllDealPhaseChanges.bind(this, today, tomorrow))
      .then(filterNewChanges.bind(this))
      .then(this.notifyAndSaveChanges.bind(this, today, tomorrow))
      .catch((err) => {
        console.error('unable to check deal phase changes', err);
      });

    function filterNewChanges(changes) {
      const newChanges = [];
      changes.forEach((change) => {
        if (!this.alreadyNotifiedChanges[this.getUniqueId(change)]) {
          newChanges.push(change);
        }
      });
      return newChanges;
    }
  }

  /**
   * @param {Object[]} changes A list of changes to notify
   * @returns {Object[]} The list of notified changes
   */
  notifyAndSaveChanges(from, to, changes) {
    if (changes.length > 0) { console.log('notifying %s deal phase changes', changes.length); }

    // Sort changes by change_date
    changes.sort((a, b) => {
      if (a.change_date < b.change_date) {
        return -1;
      } else if (a.change_date > b.change_date) {
        return 1;
      }
      return 0;
    });

    // Notify changes in sequence to keep order and avoid flooding Teamleader API
    const notify = items => items.reduce((p, ch) => p.then(() => this.notifyAndSaveChange(from, to, ch)), Promise.resolve());
    return notify(changes);
  }

  notifyAndSaveChange(from, to, change) {
    return this.getDeal(change.deal_id)
      .then((deal) => {
        const title = he.decode(deal.title);
        const userName = he.decode(this.users[change.related_user_id].name);
        const toPhase = he.decode(this.dealPhases[change.new_phase_id].name);
        if (!change.old_phase_id) { return `New deal *${title}* in phase ${toPhase} (by ${userName})`; }

        const fromPhase = he.decode(this.dealPhases[change.old_phase_id].name);
        return `Deal *${title}* (${deal.total_price_excl_vat} ${this.currency}) moved to *${toPhase}* (from ${fromPhase}, by ${userName})`;
      })
      .then(this.notifier.notify.bind(this.notifier))
      .then(this.saveNotifiedChange.bind(this, from, to, change))
      .then(() => {
        this.alreadyNotifiedChanges[this.getUniqueId(change)] = true;
        return change;
      });
  }

  saveNotifiedChange(from, to, change) {
    return new Promise((resolve, reject) => {
      const file = this.getDataFilePath(from, to);
      const data = this.getUniqueId(change);
      fs.appendFile(file, `${data}\n`, (err) => {
        if (err) { return reject(err); }
        return resolve(change);
      });
    });
  }

  getDataFilePath(from, to) {
    const fromStr = DealPhaseWatcher.dateToString(from).split('/').join('-');
    const toStr = DealPhaseWatcher.dateToString(to).split('/').join('-');
    return path.join('./data', `${this.dataFileName}_${fromStr}_${toStr}.txt`);
  }

  getUniqueId(change) {
    return `${change.deal_id}_${change.change_date}`;
  }

  getAllDealPhaseChanges(from, to) {
    return new Promise((resolve, reject) => {
      this.tl.post('getAllDealPhaseChanges', {
        date_from: DealPhaseWatcher.dateToString(from),
        date_to: DealPhaseWatcher.dateToString(to),
      }, (err, changes) => {
        if (err) { return reject(err); }
        return resolve(changes);
      });
    });
  }

  /**
   * Read notified changes from file and load them in memory
   * @param {Date} from
   * @param {Date} to
   */
  loadNotifiedChanges(from, to) {
    return new Promise((resolve, reject) => {
      const file = this.getDataFilePath(from, to);
      fs.readFile(file, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') { return reject(err); }
        if (!err) {
          const changeIds = data.split('\n');
          changeIds.forEach(id => (this.alreadyNotifiedChanges[id] = true));
          return resolve(this);
        }
        return resolve(this);
      });
    });
  }

  loadUsers() {
    return this.getUsers()
      .then((users) => {
        this.users = {};
        users.forEach((u) => { this.users[u.id] = u; });
        return this;
      });
  }

  loadDealPhases() {
    return this.getDealPhases()
      .then((phases) => {
        this.dealPhases = {};
        phases.forEach((p) => { this.dealPhases[p.id] = p; });
        return this;
      });
  }
}

module.exports = DealPhaseWatcher;
