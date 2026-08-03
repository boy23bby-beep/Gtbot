module.exports.config = {
    name: "pickup",
    aliases: ["pickupline", "flirt"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Get a random pickup line",
    category: "fun",
    guide: { en: "{pn} or {pn} @tag" }
};

const lines = [
    "Are you a magician? Because whenever I look at you, everyone else disappears.",
    "Do you have a map? I keep getting lost in your eyes.",
    "Is your name Google? Because you have everything I've been searching for.",
    "Are you a bank loan? Because you've got my interest.",
    "Do you have a Band-Aid? Because I just scraped my knee falling for you.",
    "Are you a parking ticket? Because you've got 'fine' written all over you.",
    "If you were a vegetable, you'd be a cute-cumber.",
    "Do you believe in love at first text, or should I text again?",
    "Are you a time traveler? Because I see you in my future.",
    "Is it hot in here, or is it just you?",
    "Your hand looks heavy — can I hold it for you?",
    "Are you a star? Because your beauty lights up the night.",
    "If beauty were a crime, you'd be serving a life sentence.",
    "Are you wifi? Because I feel a connection.",
    "I must be a snowflake because I've fallen for you."
];

module.exports.onStart = async ({ api, event, usersData }) => {
    const targetID = Object.keys(event.mentions)[0];
    const line = lines[Math.floor(Math.random() * lines.length)];
    if (targetID) {
        const name = await usersData.getName(targetID).catch(() => "you");
        return api.sendMessage(`💘 To ${name}:\n\n${line}`, event.threadID, event.messageID);
    }
    api.sendMessage(`💘 ${line}`, event.threadID, event.messageID);
};
