module.exports.config = {
    name: "ban",
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 2,
    description: "Ban a user from using the bot",
    category: "admin",
    guide: { en: "{pn} @tag or reply <reason>" }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const targetID = Object.keys(event.mentions)[0] || (event.messageReply?.senderID);
    if (!targetID) return api.sendMessage("❌ Tag or reply to a user to ban them.", event.threadID, event.messageID);
    if (global.GoatBot.config.adminBot.includes(targetID)) return api.sendMessage("❌ Cannot ban a bot admin.", event.threadID, event.messageID);
    const reason = args.filter(a => !a.includes(targetID)).join(" ") || "No reason";
    await usersData.set(targetID, { banned: { status: true, reason, date: new Date().toLocaleDateString() } });
    const name = await usersData.getName(targetID).catch(() => targetID);
    api.sendMessage(`🚫 Banned: ${name}\n📝 Reason: ${reason}`, event.threadID, event.messageID);
};
