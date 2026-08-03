module.exports.config = {
    name: "truth",
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Get a random truth question",
    category: "fun",
    guide: { en: "{pn}" }
};

const truths = [
    "What is your biggest fear?",
    "Have you ever lied to your best friend? What about?",
    "What's the most embarrassing thing you've done in public?",
    "What is the biggest lie you've ever told?",
    "Have you ever cheated on a test?",
    "What is the weirdest dream you've ever had?",
    "Who was your first crush?",
    "What's something you've never told your parents?",
    "Have you ever broken something valuable and blamed someone else?",
    "What's the most childish thing you still do?",
    "What was your most embarrassing moment in school?",
    "Have you ever sent a text to the wrong person? What did it say?",
    "What's the silliest reason you've ever cried?",
    "If you could be invisible for a day, what would you do?",
    "What's something you've done that you hope no one finds out about?"
];

module.exports.onStart = async ({ api, event }) => {
    const q = truths[Math.floor(Math.random() * truths.length)];
    api.sendMessage(`🤔 Truth:\n\n${q}`, event.threadID, event.messageID);
};
