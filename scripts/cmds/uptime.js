module.exports.config = {
    name: "uptime",
    aliases: ["ut"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Show how long the bot has been running",
    category: "info",
    guide: { en: "{pn}" }
};

module.exports.onStart = async ({ api, event }) => {
    const ms = Date.now() - global.GoatBot.startTime;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    const time = `${d}d ${h % 24}h ${m % 60}m ${s % 60}s`;
    api.sendMessage(`⏱️ Bot Uptime: ${time}`, event.threadID, event.messageID);
};
