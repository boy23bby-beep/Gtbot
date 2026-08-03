module.exports.config = {
    name: "roast",
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Roast someone (all in fun!)",
    category: "fun",
    guide: { en: "{pn} @tag or reply" }
};

const roasts = [
    "You're not stupid; you just have bad luck thinking.",
    "I'd agree with you, but then we'd both be wrong.",
    "You're the reason the gene pool needs a lifeguard.",
    "You bring everyone so much joy when you leave the room.",
    "I'd call you a tool, but tools are actually useful.",
    "You have your entire life to be stupid. Why not take today off?",
    "You're proof that even evolution makes mistakes sometimes.",
    "I've met some pricks in my time, but you're a whole cactus.",
    "Your secrets are always safe with me. I never listen when you talk.",
    "I don't know what your problem is, but I bet it's hard to pronounce.",
    "You're a gray sprinkle on a rainbow cupcake.",
    "Some day you'll go far — and I really hope you stay there."
];

module.exports.onStart = async ({ api, event, usersData }) => {
    const targetID = Object.keys(event.mentions)[0] || event.messageReply?.senderID || event.senderID;
    const name = await usersData.getName(targetID).catch(() => "You");
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    api.sendMessage(`🔥 Roasting ${name}:\n\n${roast}`, event.threadID, event.messageID);
};
