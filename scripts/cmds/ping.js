module.exports.config = {
    name: "ping",
    aliases: ["speed"],
    version: "1.0",
    author: "ARIF",
    countDown: 3,
    role: 0,
    description: "Check bot response speed",
    category: "info",
    guide: { en: "{pn}" }
};

module.exports.onStart = async ({ api, event }) => {
    const start = Date.now();
    api.sendMessage("🏓 Pinging...", event.threadID, (err, info) => {
        if (err) return;
        const ms = Date.now() - start;
        api.editMessage(`🏓 Pong!\n⚡ Speed: ${ms}ms`, info.messageID);
    }, event.messageID);
};
