// Trigger when a new member joins the thread
module.exports = async function ({ api, event, bus, settings }) {
  try {
    const threadID = event.threadID || event.thread_id || event.thread;
    const added = event.logMessageData && event.logMessageData.addedParticipants
      ? event.logMessageData.addedParticipants
      : (event.addedParticipants ? event.addedParticipants : null);

    const userID = Array.isArray(added) ? (added[0].userFbId || added[0].id) : (event.author || event.senderID);

    const msg = `User joined: ${userID} in thread ${threadID}`;
    console.log('[JOIN]', msg);
    bus.emit('log', { level: 'info', tag: 'JOIN', msg, data: { threadID, userID } });

    // Welcome message (toggleable)
    const cfg = settings || require('../../dashboard/eventsConfig.json');
    if (cfg.welcomeEnabled) {
      const text = cfg.welcomeMessage || 'Welcome!';
      try { api && api.sendMessage && api.sendMessage(text, threadID); } catch (e) { console.error('welcome send error', e); }
    }
  } catch (err) {
    console.error('join handler error', err);
  }
};

require('./bus').on('join', (payload) => module.exports(payload));
