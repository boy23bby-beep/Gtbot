const axios = require("axios");

module.exports.config = {
    name: "quote",
    aliases: ["q"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Get a random inspirational quote",
    category: "fun",
    guide: { en: "{pn}" }
};

const fallback = [
    { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { content: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
];

module.exports.onStart = async ({ api, event }) => {
    try {
        const { data } = await axios.get("https://api.quotable.io/random", { timeout: 5000 });
        api.sendMessage(`💬 "${data.content}"\n\n— ${data.author}`, event.threadID, event.messageID);
    } catch {
        const q = fallback[Math.floor(Math.random() * fallback.length)];
        api.sendMessage(`💬 "${q.content}"\n\n— ${q.author}`, event.threadID, event.messageID);
    }
};
