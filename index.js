
require('console-stamp')(console);

const DealPhaseWatcher = require('./watchers/deal_phase_watcher');

const watchers = [
  new DealPhaseWatcher(),
];

function initializeWatchers(items) {
  return Promise.all(items.map(watcher => watcher.initialize()));
}

function startWatchers(items) {
  return Promise.all(items.map(watcher => watcher.start()));
}

console.log('starting watchers...');
Promise.resolve(watchers)
  .then(initializeWatchers)
  .then(startWatchers)
  .then(() => {
    console.log('all watchers have been started!');
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });

