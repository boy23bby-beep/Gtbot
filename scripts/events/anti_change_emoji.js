// Revert thread emoji changes
module.exports = async function ({ api, event, bus, settings }) {
  try {
    const cfg = settings || require('../../dashboard/eventsConfig.json');
    if (!cfg.anti_change_emoji) return;

    const threadID = event.threadID || event.thread_id || event.thread;
    const log = event.logMessageData || {};
    if (log.threadEmoji && (log.threadEmoji.new || log.threadEmoji['new'])) {
      const oldEmoji = log.threadEmoji.old || log.threadEmoji['old'] || (cfg.defaultEmoji || '👍');
      if (api && api.changeThreadEmoji) {
        await api.changeThreadEmoji(oldEmoji, threadID);
        bus.emit('log', { level: 'warn', tag: 'ANTI_EMOJI', msg: `Reverted emoji to ${oldEmoji}`, data: { threadID } });
      } else {
        bus.emit('log', { level: 'warn', tag: 'ANTI_EMOJI', msg: 'changeThreadEmoji not available on API' });
      }
    }
  } catch (err) {
    console.error('anti_change_emoji error', err);
  }
};

require('./bus').on('anti_change_emoji', (payload) => module.exports(payload));
