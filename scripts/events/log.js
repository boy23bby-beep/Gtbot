// Log event — writes to console and forwards to bus
module.exports = async function ({ event, bus }) {
  try {
    const info = {
      time: new Date().toISOString(),
      type: 'log',
      detail: event
    };
    console.log('[EVENT LOG]', JSON.stringify(info, null, 2));
    bus.emit('log', { level: 'info', tag: 'EVENT', msg: 'Event logged', data: info });
  } catch (err) {
    console.error('log handler error', err);
  }
};

require('./bus').on('log', (payload) => {
  // logger bus listener (keeps module loaded). actual handlers emit bus 'log' events.
});
