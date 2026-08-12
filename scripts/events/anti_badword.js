// Simple bad-words filter. Checks message text, deletes, warns user.
const path = require('path');

function getBadWords() {
  try {
    const cfg = require('../../dashboard/eventsConfig.json');
    return cfg.badWords || ['badword1', 'badword2'];
  } catch (e) {
    return ['badword1', 'badword2'];
  }
}

module.exports = async function ({ api, event, bus, settings }) {
  try {
    const cfg = settings || require('../../dashboard/eventsConfig.json');
    if (!cfg.anti_badword) return;

    const text = event.body || (event.message && event.message.body) || '';
    if (!text) return;

    const badWords = getBadWords().map(w => w.toLowerCase());
    const lc = text.toLowerCase();
    const found = badWords.find(b => lc.includes(b));
    if (found) {
      // Try to delete the message if API supports
      try { if (api && api.deleteMessage && event.messageID) await api.deleteMessage(event.messageID); } catch (e) { /* ignore */ }

      const warnText = cfg.badwordWarning || `Please do not use offensive words.`;
      try { if (api && api.sendMessage) await api.sendMessage(warnText, event.threadID); } catch (e) { /* ignore */ }

      bus.emit('log', { level: 'warn', tag: 'ANTI_BADWORD', msg: `Bad word detected (${found}) by ${event.senderID || event.author}`, data: { threadID: event.threadID, sender: event.senderID || event.author } });
    }
  } catch (err) {
    console.error('anti_badword error', err);
  }
};

require('./bus').on('message', (payload) => module.exports(payload));
