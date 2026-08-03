module.exports.config = {
    name: "restart",
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 2,
    description: "Restart the bot",
    category: "admin",
    guide: { en: "{pn}" }
};

module.exports.onStart = async ({ api, event }) => {
    await api.sendMessage("🔄 Restarting bot...", event.threadID, event.messageID);
    setTimeout(() => process.exit(2), 1000);
};
