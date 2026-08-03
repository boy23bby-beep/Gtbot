module.exports.config = {
    name: "8ball",
    aliases: ["magic8ball"],
    version: "1.0",
    author: "ARIF",
    countDown: 3,
    role: 0,
    description: "Ask the magic 8 ball a yes/no question",
    category: "fun",
    guide: { en: "{pn} <your question>" }
};

const answers = [
    "🟢 It is certain.", "🟢 Without a doubt.", "🟢 Yes, definitely!",
    "🟢 You may rely on it.", "🟢 As I see it, yes.", "🟢 Most likely.",
    "🟡 Reply hazy, try again.", "🟡 Ask again later.", "🟡 Cannot predict now.",
    "🔴 Don't count on it.", "🔴 My reply is no.", "🔴 Very doubtful.",
    "🔴 Outlook not so good.", "🔴 My sources say no.", "🔴 Absolutely not!"
];

module.exports.onStart = async ({ api, event, args }) => {
    if (!args[0]) return api.sendMessage("❓ Ask me a yes/no question!\nExample: /8ball Will I pass my exam?", event.threadID, event.messageID);
    const ans = answers[Math.floor(Math.random() * answers.length)];
    api.sendMessage(`🎱 Question: ${args.join(" ")}\n\n🔮 Answer: ${ans}`, event.threadID, event.messageID);
};
