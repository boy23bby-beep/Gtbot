// Revert chat theme/color changes
module.exports = async function ({ api, event, bus, settings }) {
  try {
    const cfg = settings || require('../../dashboard/eventsConfig.json');
    if (!cfg.anti_change_theme) return;

    const threadID = event.threadID || event.thread_id || event.thread;
    const log = event.logMessageData || {};
    if (log.threadColor && (log.threadColor.new || log.threadColor['new'])) {
      const oldColor = log.threadColor.old || log.threadColor['old'] || (cfg.defaultThemeColor || 'blue');
      if (api && api.setThreadColor) {
        await api.setThreadColor(oldColor, threadID);
        bus.emit('log', { level: 'warn', tag: 'ANTI_THEME', msg: `Reverted thread color to ${oldColor}`, data: { threadID } });
      } else {
        bus.emit('log', { level: 'warn', tag: 'ANTI_THEME', msg: 'setThreadColor not available on API' });
      }
    }
  } catch (err) {
    console.error('anti_change_theme error', err);
  }
};

require('./bus').on('anti_change_theme', (payload) => module.exports(payload));
