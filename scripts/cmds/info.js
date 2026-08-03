const os = require("os");

module.exports.config = {
    name: "info",
    aliases: ["botinfo"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Show bot system info",
    category: "info",
    guide: { en: "{pn}" }
};

module.exports.onStart = async ({ api, event }) => {
    const { commands, config } = global.GoatBot;
    const ms = Date.now() - global.GoatBot.startTime;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const uptime = `${Math.floor(h / 24)}d ${h % 24}h ${m % 60}m`;
    const mem = process.memoryUsage();
    const usedMB = (mem.heapUsed / 1024 / 1024).toFixed(1);
    const totalMB = (mem.heapTotal / 1024 / 1024).toFixed(1);

    api.sendMessage(
        `🤖 BOT INFORMATION\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `📛 Name: ${config.nickNameBot || "HINATA BOT"}\n` +
        `🆔 ID: ${global.GoatBot.botID}\n` +
        `📦 Version: ${require("../../package.json").version}\n` +
        `⏱️ Uptime: ${uptime}\n` +
        `⌨️ Commands: ${commands.size}\n` +
        `🧠 Memory: ${usedMB}MB / ${totalMB}MB\n` +
        `🖥️ Node: ${process.version}\n` +
        `💻 Platform: ${os.platform()}\n` +
        `🔑 Prefix: ${config.prefix}`,
        event.threadID, event.messageID
    );
};
