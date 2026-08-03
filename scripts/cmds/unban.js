module.exports.config = {
    name: "unban",
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 2,
    description: "Unban a user",
    category: "admin",
    guide: { en: "{pn} @tag or reply" }
};

module.exports.onStart = async ({ api, event, usersData }) => {
    const targetID = Object.keys(event.mentions)[0] || event.messageReply?.senderID;
    if (!targetID) return api.sendMessage("❌ Tag or reply to a user to unban them.", event.threadID, event.messageID);
    await usersData.set(targetID, { banned: { status: false, reason: null, date: null } });
    const name = await usersData.getName(targetID).catch(() => targetID);
    api.sendMessage(`✅ Unbanned: ${name}`, event.threadID, event.messageID);
};
