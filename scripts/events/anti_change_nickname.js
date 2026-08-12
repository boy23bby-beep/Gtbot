// Revert unauthorized nickname changes
module.exports = async function ({ api, event, bus, settings }) {
  try {
    const cfg = settings || require('../../dashboard/eventsConfig.json');
    if (!cfg.anti_change_nickname) return;

    const threadID = event.threadID || event.thread_id || event.thread;
    const log = event.logMessageData || {};
    if (log.changedNickname && (log.changedNickname.new || log.changedNickname['new'])) {
      const target = log.changedNickname.target || log.changedNickname.userID || log.target;
      const oldNick = log.changedNickname.old || log.changedNickname['old'] || '';
      const changer = log.author || event.author || event.senderID;
      const allowed = Array.isArray(cfg.allowedNicknameChangers) ? cfg.allowedNicknameChangers : [];
      if (!allowed.includes(changer)) {
        if (api && api.setNickname) {
          try {
            await api.setNickname(oldNick, target, threadID);
            bus.emit('log', { level: 'warn', tag: 'ANTI_NICK', msg: `Reverted nickname change by ${changer}`, data: { threadID, target } });
          } catch (e) {
            console.error('setNickname error', e);
          }
        } else {
          bus.emit('log', { level: 'warn', tag: 'ANTI_NICK', msg: 'setNickname not available on API' });
        }
      }
    }
  } catch (err) {
    console.error('anti_change_nickname error', err);
  }
};

require('./bus').on('anti_change_nickname', (payload) => module.exports(payload));
