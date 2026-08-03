module.exports.config = {
    name: "rizz",
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Show off your rizz with a smooth line",
    category: "fun",
    guide: { en: "{pn} or {pn} @tag" }
};

const rizzLines = [
    "I was doing fine until you walked in and broke my whole focus.",
    "I don't need WiFi to feel a connection with you.",
    "My day was going okay until I realized I hadn't talked to you yet.",
    "You must be tired — you've been running through my mind all day.",
    "I told myself I'd stop being extra, but here I am because of you.",
    "I checked the weather today. Said you'd be looking this good.",
    "You make it really hard to play it cool.",
    "I wasn't planning to talk to anyone today, but here we are.",
    "Seeing you is literally the best part of my day.",
    "You've been living rent-free in my head and honestly I don't mind.",
    "I'd never ghost you — I'm too interested.",
    "You're the reason I check my notifications.",
    "I keep thinking of something clever to say to you and failing every time.",
    "The world has 8 billion people and somehow you're still the interesting one."
];

module.exports.onStart = async ({ api, event, usersData }) => {
    const targetID = Object.keys(event.mentions)[0];
    const line = rizzLines[Math.floor(Math.random() * rizzLines.length)];
    if (targetID) {
        const name = await usersData.getName(targetID).catch(() => "you");
        return api.sendMessage(`😎 To ${name}:\n\n${line}`, event.threadID, event.messageID);
    }
    api.sendMessage(`😎 ${line}`, event.threadID, event.messageID);
};
