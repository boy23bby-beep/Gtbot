const fs = require('fs-extra');
const path = require('path');
const bus = require('./bus');

const SETTINGS_PATH = path.join(__dirname, '..', '..', 'dashboard', 'eventsConfig.json');

function loadSettings() {
  try {
    return fs.readJSONSync(SETTINGS_PATH);
  } catch (e) {
    return {
      anti_change_name: true,
      anti_change_theme: true,
      anti_change_emoji: true,
      anti_change_nickname: true,
      anti_out: true,
      anti_spam: true,
      anti_badword: true
    };
  }
}

let settings = loadSettings();
let apiRef = null;
let getTextRef = null;
let threadsDataRef = null;
let usersDataRef = null;

function initEvents({ api, getText, threadsData, usersData } = {}) {
  apiRef = api;
  getTextRef = getText;
  threadsDataRef = threadsData;
  usersDataRef = usersData;

  // watch config for runtime changes
  fs.watchFile(SETTINGS_PATH, { interval: 1000 }, () => {
    settings = loadSettings();
    bus.emit('log', { level: 'info', tag: 'CONFIG', msg: 'Event settings reloaded' });
  });

  bus.emit('log', { level: 'info', tag: 'EVENTS', msg: 'Events loader initialized' });
}

async function emit(eventName, eventData) {
  try {
    bus.emit(eventName, {
      api: apiRef,
      event: eventData,
      settings,
      getText: getTextRef,
      threadsData: threadsDataRef,
      usersData: usersDataRef,
      bus
    });
  } catch (err) {
    console.error('events/loader emit error', err);
  }
}

module.exports = {
  initEvents,
  emit,
  _getSettings: () => settings,
  SETTINGS_PATH
};
