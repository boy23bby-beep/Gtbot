module.exports.config = {
    name: "dare",
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Get a random dare challenge",
    category: "fun",
    guide: { en: "{pn}" }
};

const dares = [
    "Send a voice message saying 'I love you' to the last person you texted.",
    "Change your profile picture to a silly selfie for 24 hours.",
    "Send a message to your crush saying 'Hey, I miss you!'",
    "Write a poem about the person to your left and read it aloud.",
    "Text your mom 'I accidentally dyed my hair green'.",
    "Do your best impression of another group member.",
    "Send the last photo in your gallery to this chat.",
    "Try to lick your elbow for 10 seconds.",
    "Say 'I love pickles on ice cream' with a straight face.",
    "Call someone in your contact list and sing Happy Birthday.",
    "Post an embarrassing childhood photo in this chat.",
    "Speak in a funny accent for the next 3 messages.",
    "Type your next message with your eyes closed.",
    "Send a heart emoji to the first 5 people in your contact list.",
    "Do 10 pushups and send a photo as proof."
];

module.exports.onStart = async ({ api, event }) => {
    const d = dares[Math.floor(Math.random() * dares.length)];
    api.sendMessage(`🎯 Dare:\n\n${d}`, event.threadID, event.messageID);
};
