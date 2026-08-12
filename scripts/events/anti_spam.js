// Simple flood/spam detection: track a short message history per user in memory
const userHits = {};
const WINDOW_MS = 8 * 1000; // 8 seconds window
const MAX_MSGS = 5; // >5 messages in window => spam
const DEFAULT_TEMP_MUTE_MS = 60 * 1000; // 1 minute mute

module.exports = async function ({ api, event, bus, settings }) {
  try {
    const cfg = settings || require('../../dashboard/eventsConfig.json');
    if (!cfg.anti_spam) return;

    const threadID = event.threadID || event.thread_id || event.thread;
    const sender = event.senderID || event.author || (event.logMessageData && event.logMessageData.actorFbId);
    if (!sender) return;

    const now = Date.now();
    if (!userHits[sender]) userHits[sender] = [];
    userHits[sender].push(now);
    userHits[sender] = userHits[sender].filter(t => now - t <= (cfg.spamWindowMs || WINDOW_MS));

    if (userHits[sender].length > (cfg.spamMaxMsgs || MAX_MSGS)) {
      userHits[sender] = [];
      const TEMP_MUTE_MS = cfg.spamMuteMs || DEFAULT_TEMP_MUTE_MS;
      if (!global.tempSpam) global.tempSpam = {};
      global.tempSpam[sender] = Date.now() + TEMP_MUTE_MS;

      const warn = cfg.spamWarningMessage || `You are sending messages too fast. You are muted for ${Math.round(TEMP_MUTE_MS/1000)}s.`;
      try { api && api.sendMessage && api.sendMessage(warn, threadID); } catch (e) { /* ignore */ }
      bus.emit('log', { level: 'warn', tag: 'ANTI_SPAM', msg: `Muted ${sender} for spam`, data: { threadID, sender } });
    } else {
      if (global.tempSpam && global.tempSpam[sender] && global.tempSpam[sender] > Date.now()) {
        // delete message if API supports
        try { api && api.deleteMessage && event.messageID && api.deleteMessage(event.messageID); } catch (e) { /* ignore */ }
        return;
      }
    }
  } catch (err) {
    console.error('anti_spam error', err);
  }
};

// spam handler listens to 'message' events
require('./bus').on('message', (payload) => module.exports(payload));
