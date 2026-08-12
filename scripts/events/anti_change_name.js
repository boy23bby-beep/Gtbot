// Revert group name changes if setting enabled
module.exports = async function ({ api, event, bus, settings }) {
  try {
    const cfg = settings || require('../../dashboard/eventsConfig.json');
    if (!cfg.anti_change_name) return;

    const threadID = event.threadID || event.thread_id || event.thread;
    const log = event.logMessageData || {};
    if (log.threadName && (log.threadName.new || log.threadName['new'])) {
      const newName = log.threadName.new || log.threadName['new'];
      const oldName = log.threadName.old || log.threadName['old'] || cfg.defaultThreadName || 'Group';
      if (api && api.changeThreadTitle) {
        await api.changeThreadTitle(oldName, threadID);
        bus.emit('log', { level: 'warn', tag: 'ANTI_NAME', msg: `Reverted thread name ${newName} -> ${oldName}`, data: { threadID } });
      } else {
        bus.emit('log', { level: 'warn', tag: 'ANTI_NAME', msg: 'changeThreadTitle not available on API' });
      }
    }
  } catch (err) {
    console.error('anti_change_name error', err);
  }
};

require('./bus').on('anti_change_name', (payload) => module.exports(payload));
