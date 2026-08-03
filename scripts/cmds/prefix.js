module.exports.config = {
    name: "prefix",
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Show or change the bot prefix",
    category: "admin",
    guide: { en: "{pn} — show prefix\n{pn} <new prefix> — change prefix (admin only)" }
};

module.exports.onStart = async ({ api, event, args }) => {
    const { config } = global.GoatBot;
    if (!args[0]) return api.sendMessage(`🔑 Current prefix: ${config.prefix}`, event.threadID, event.messageID);
    if (!config.adminBot.includes(event.senderID)) return api.sendMessage("❌ Only bot admins can change the prefix.", event.threadID, event.messageID);
    const newPrefix = args[0].trim();
    config.prefix = newPrefix;
    const fs = require("fs-extra");
    fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
    api.sendMessage(`✅ Prefix changed to: ${newPrefix}`, event.threadID, event.messageID);
};
