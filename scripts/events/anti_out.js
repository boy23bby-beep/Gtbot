// Prevent or handle user leaving the thread
module.exports = async function ({ api, event, bus, settings }) {
  try {
    const cfg = settings || require('../../dashboard/eventsConfig.json');
    if (!cfg.anti_out) return;

    const threadID = event.threadID || event.thread_id || event.thread;
    const left = event.logMessageData?.leftParticipant || event.logMessageData?.leftParticipants || null;
    if (!left) return;

    const leftId = left.userFbId || left.id || (Array.isArray(left) ? left[0]?.id : null);
    if (!leftId) return;

    try {
      if (api && api.addUserToGroup) {
        await api.addUserToGroup(leftId, threadID);
        bus.emit('log', { level: 'warn', tag: 'ANTI_OUT', msg: `Re-added ${leftId} to ${threadID}` });
      } else {
        bus.emit('log', { level: 'warn', tag: 'ANTI_OUT', msg: 'addUserToGroup not available on API' });
      }
    } catch (e) {
      console.error('anti_out add error', e);
    }
  } catch (err) {
    console.error('anti_out error', err);
  }
};

require('./bus').on('anti_out', (payload) => module.exports(payload));
