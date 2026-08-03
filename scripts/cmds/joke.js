const axios = require("axios");

module.exports.config = {
    name: "joke",
    aliases: ["jokes"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Get a random joke",
    category: "fun",
    guide: { en: "{pn}" }
};

module.exports.onStart = async ({ api, event }) => {
    try {
        const { data } = await axios.get("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist");
        const text = data.type === "single"
            ? `😂 ${data.joke}`
            : `😂 ${data.setup}\n\n🥁 ${data.delivery}`;
        api.sendMessage(text, event.threadID, event.messageID);
    } catch {
        api.sendMessage("😂 Why did the bot fail?\nBecause it had too many jokes to choose from!", event.threadID, event.messageID);
    }
};
