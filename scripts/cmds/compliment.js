module.exports.config = {
    name: "compliment",
    aliases: ["comp"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Send a compliment to someone",
    category: "fun",
    guide: { en: "{pn} @tag or reply" }
};

const compliments = [
    "You have a great sense of humor!",
    "You're more fun than bubble wrap!",
    "You are one of the most amazing people I've ever met.",
    "You light up the room whenever you walk in.",
    "Your smile is absolutely contagious!",
    "You make the world a better place just by being in it.",
    "You're incredibly talented and it shows.",
    "You have the best heart of anyone I know.",
    "You always know how to make people feel valued.",
    "You're like sunshine on a cloudy day.",
    "People are so lucky to have you in their life.",
    "You have an incredible ability to make people feel happy."
];

module.exports.onStart = async ({ api, event, usersData }) => {
    const targetID = Object.keys(event.mentions)[0] || event.messageReply?.senderID || event.senderID;
    const name = await usersData.getName(targetID).catch(() => "You");
    const comp = compliments[Math.floor(Math.random() * compliments.length)];
    api.sendMessage(`💖 To ${name}:\n\n${comp}`, event.threadID, event.messageID);
};
