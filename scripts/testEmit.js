(async () => {
  const path = require('path');
  const events = require(path.join(__dirname, '..', 'scripts', 'events', 'loader'));

  console.log('[testEmit] registered events ->', events.getRegistered());

  // Register a temporary test handler to confirm emit works
  events.register('message', async (payload) => {
    try {
      console.log('[testEmit] handler called with payload:');
      console.log(JSON.stringify({
        event: payload.event,
        settings: payload.settings && Object.keys(payload.settings).length ? payload.settings : undefined
      }, null, 2));
    } catch (e) {
      console.error('[testEmit] handler error', e);
    }
  });

  // Create a mock API client with sendMessage to observe replies
  const api = {
    sendMessage: async (msg, threadID, cb) => {
      console.log('[mock api] sendMessage ->', msg, 'threadID:', threadID);
      if (typeof cb === 'function') cb();
    }
  };

  const mockEvent = {
    threadID: '1234567890123456',
    body: '!test',
    senderID: '1000000000',
    messageID: 'm_test_1',
    isGroup: false
  };

  console.log('[testEmit] emitting message event...');
  events.emit('message', {
    api,
    event: mockEvent,
    settings: {},
    threadsData: {},
    usersData: {}
  });

  // wait briefly to let async handlers run
  await new Promise(r => setTimeout(r, 700));
  console.log('[testEmit] finished');
  process.exit(0);
})();
