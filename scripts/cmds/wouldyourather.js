module.exports.config = {
    name: "wouldyourather",
    aliases: ["wyr"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Get a random 'would you rather' question",
    category: "fun",
    guide: { en: "{pn}" }
};

const questions = [
    ["Be invisible", "Be able to fly"],
    ["Always be 10 minutes late", "Always be 20 minutes early"],
    ["Have free WiFi everywhere", "Have free food everywhere"],
    ["Be super strong", "Be super fast"],
    ["Live in the past", "Live in the future"],
    ["Never use social media again", "Never watch movies or TV again"],
    ["Have unlimited money but no love", "Have unlimited love but no money"],
    ["Be famous", "Be powerful"],
    ["Speak every language", "Play every instrument"],
    ["Know the date you'll die", "Know how you'll die"],
    ["Always be cold", "Always be hot"],
    ["Never sleep again", "Always sleep 12 hours a day"],
    ["Be a genius but ugly", "Be average but very attractive"],
    ["Forget who you are", "Forget everyone you love"]
];

module.exports.onStart = async ({ api, event }) => {
    const [a, b] = questions[Math.floor(Math.random() * questions.length)];
    api.sendMessage(`🤷 Would You Rather:\n\n🅰️ ${a}\n\nOR\n\n🅱️ ${b}`, event.threadID, event.messageID);
};
