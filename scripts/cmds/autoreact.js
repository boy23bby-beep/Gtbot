module.exports.config = {
    name: "autoreact",
    aliases: ["ar"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 1,
    description: "Auto react to every message in this group",
    category: "group",
    guide: { en: "{pn} on/off [emoji]\nExample: {pn} on ❤️" }
};

if (!global.autoReactThreads) global.autoReactThreads = {};

module.exports.onStart = async ({ api, event, args }) => {
    const tid = event.threadID;
    if (!args[0]) {
        const current = global.autoReactThreads[tid];
        return api.sendMessage(
            current ? `✅ Autoreact is ON with emoji: ${current}` : `❌ Autoreact is OFF`,
            event.threadID, event.messageID
        );
    }
    if (args[0].toLowerCase() === "off") {
        delete global.autoReactThreads[tid];
        return api.sendMessage("❌ Autoreact turned OFF.", event.threadID, event.messageID);
    }
    if (args[0].toLowerCase() === "on") {
        const emoji = args[1] || "❤️";
        global.autoReactThreads[tid] = emoji;
        return api.sendMessage(`✅ Autoreact turned ON! Reacting with: ${emoji}`, event.threadID, event.messageID);
    }
    api.sendMessage("Usage: autoreact on [emoji] / autoreact off", event.threadID, event.messageID);
};

module.exports.onChat = async ({ api, event }) => {
    const emoji = global.autoReactThreads?.[event.threadID];
    if (!emoji || !event.messageID) return;
    if (event.senderID === global.GoatBot.botID) return;
    api.setMessageReaction(emoji, event.messageID, () => {}, true);
};
