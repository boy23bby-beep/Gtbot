const axios = require("axios");

module.exports.config = {
    name: "fact",
    aliases: ["facts"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Get a random interesting fact",
    category: "fun",
    guide: { en: "{pn}" }
};

const fallback = [
    "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs.",
    "A group of flamingos is called a flamboyance.",
    "Octopuses have three hearts and blue blood.",
    "Bananas are berries, but strawberries aren't.",
    "The shortest war in history lasted 38–45 minutes (Anglo-Zanzibar War, 1896).",
    "A day on Venus is longer than a year on Venus.",
    "Humans share 60% of their DNA with bananas.",
    "The Eiffel Tower can be 15 cm taller in summer due to heat expansion."
];

module.exports.onStart = async ({ api, event }) => {
    try {
        const { data } = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en", { timeout: 5000 });
        api.sendMessage(`🧠 Fact: ${data.text}`, event.threadID, event.messageID);
    } catch {
        const f = fallback[Math.floor(Math.random() * fallback.length)];
        api.sendMessage(`🧠 Fact: ${f}`, event.threadID, event.messageID);
    }
};
