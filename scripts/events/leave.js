module.exports = async function ({ api, event, bus }) {
  try {
    const threadID = event.threadID || event.thread_id || event.thread;
    const left = event.logMessageData && (event.logMessageData.leftParticipant || event.logMessageData.leftParticipants)
      ? (event.logMessageData.leftParticipant || (Array.isArray(event.logMessageData.leftParticipants) ? event.logMessageData.leftParticipants[0] : null))
      : null;

    const leftId = left ? (left.userFbId || left.id) : (event.author || event.senderID);

    const msg = `User left: ${leftId} from ${threadID}`;
    console.log('[LEAVE]', msg);
    bus.emit('log', { level: 'info', tag: 'LEAVE', msg, data: { threadID, leftId } });

    const cfg = require('../../dashboard/eventsConfig.json');
    if (cfg.anti_out) {
      try {
        if (api && api.addUserToGroup) {
          await api.addUserToGroup(leftId, threadID);
          bus.emit('log', { level: 'warn', tag: 'ANTI_OUT', msg: `Re-added ${leftId}`, data: { threadID } });
        } else {
          bus.emit('log', { level: 'warn', tag: 'ANTI_OUT', msg: 'addUserToGroup not available on API' });
        }
      } catch (e) {
        console.error('anti_out readd error', e);
      }
    }
  } catch (err) {
    console.error('leave handler error', err);
  }
};

require('./bus').on('leave', (payload) => module.exports(payload));
