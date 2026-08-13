const fs = require('fs-extra');
const path = require('path');

const EVENTS_DIR = __dirname; // scripts/events
const handlers = {}; // { eventName: [fn, ...] }

function register(eventName, fn) {
  if (!handlers[eventName]) handlers[eventName] = [];
  handlers[eventName].push(fn);
}

function loadAll() {
  const files = fs.readdirSync(EVENTS_DIR)
    .filter(f => f.endsWith('.js') && f !== path.basename(__filename));
  for (const file of files) {
    const full = path.join(EVENTS_DIR, file);
    try {
      delete require.cache[require.resolve(full)];
      const mod = require(full);
      if (mod && typeof mod === 'object' && mod.event && typeof mod.handler === 'function') {
        register(mod.event, mod.handler);
        console.info(`Registered event: ${mod.event} from ${file}`);
      } else if (typeof mod === 'function') {
        const evt = path.basename(file, '.js');
        register(evt, mod);
        console.info(`Registered fallback event: ${evt} from ${file}`);
      } else if (mod && typeof mod.onStart === 'function' && mod.config && mod.config.name) {
        // compatible with Hinata-style event modules (config + onStart)
        // wrap onStart so it receives same payload shape
        register(mod.config.name, async (payload) => {
          try {
            const res = await mod.onStart(payload);
            if (typeof res === 'function') {
              // some modules return a function to be executed (Hinata pattern)
              await res();
            }
          } catch (e) { console.error(`event ${mod.config.name} error`, e); }
        });
        console.info(`Registered Hinata-style event: ${mod.config.name} from ${file}`);
      } else {
        console.warn(`Skipping ${file}: unsupported export shape`);
      }
    } catch (err) {
      console.error(`Failed to load event file ${file}:`, err);
    }
  }
}

function emit(eventName, payload) {
  const list = handlers[eventName] || [];
  for (const fn of list) {
    try {
      const res = fn(payload);
      if (res && typeof res.then === 'function') res.catch(err => console.error(`handler ${eventName} async error`, err));
    } catch (err) {
      console.error(`handler ${eventName} sync error`, err);
    }
  }
}

function getRegistered() {
  return Object.keys(handlers);
}

loadAll();

module.exports = {
  emit,
  register,
  loadAll,
  getRegistered
};
