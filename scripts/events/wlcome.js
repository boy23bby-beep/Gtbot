const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "1.3.0",
        author: "ARIFUL",
        countDown: 5,
        role: 0,
        category: "events"
    },

    onStart: async function({ api, event, threadsData, usersData }) {
        const { threadID, logMessageType, logMessageData } = event;

        if (logMessageType === "log:subscribe") {
            const botID = api.getCurrentUserID();
            const addedParticipants = logMessageData.addedParticipants || [];

            if (addedParticipants.some(p => p.userFbId === botID)) {
                await api.sendMessage("🎉 সবাইকে ধন্যবাদ! ARIF BOT সফলভাবে গ্রুপে যুক্ত হয়েছে। 🤖✨", threadID);
                return;
            }

            if (!global.temp.welcomeEvent[threadID]) {
                global.temp.welcomeEvent[threadID] = {
                    joinTimeout: null,
                    participants: []
                };
            }

            global.temp.welcomeEvent[threadID].participants.push(...addedParticipants);
            clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

            global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
                const participants = global.temp.welcomeEvent[threadID].participants;
                delete global.temp.welcomeEvent[threadID];

                try {
                    await threadsData.refreshInfo(threadID);
                    const threadInfo = await threadsData.get(threadID) || {};
                    const threadName = threadInfo.threadName || "এই গ্রুপে";
                    const participantCount = threadInfo.participantIDs ? threadInfo.participantIDs.length : "অনেক";

                    const names = participants.map(p => `@${p.fullName}`).join(", ");
                    const mentions = participants.map(p => ({ tag: `@${p.fullName}`, id: p.userFbId }));

                    // --- CANVAS IMAGE GENERATION ---
                    let attachmentStream = null;
                    try {
                        const imgLinks = [
                            "https://i.imgur.com/HkMp1vy.jpeg",
                            "",
                            ""
                        ];
                        const randomImg = imgLinks[Math.floor(Math.random() * imgLinks.length)];
                        const image = await loadImage(randomImg);
                        const canvas = createCanvas(image.width, image.height);
                        const ctx = canvas.getContext("2d");

                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                        // টেক্সট স্টাইল
                        ctx.fillStyle = "#ffffff";
                        ctx.shadowColor = "black";
                        ctx.shadowBlur = 10;
                        ctx.textAlign = "center";

                        // বটের নাম ও গ্রুপের নাম ইমেজে বসানো
                        ctx.font = "bold 60px Arial";
                        ctx.fillText("ARIF BOT", canvas.width / 2, 100);

                        ctx.font = "bold 40px Arial";
                        ctx.fillText(`Group: ${threadName}`, canvas.width / 2, 160);

                        ctx.font = "italic 30px Arial";
                        ctx.fillText("Author: Ariful", canvas.width / 2, canvas.height - 50);

                        attachmentStream = canvas.createJPEGStream();
                    } catch (e) {
                        console.log("Canvas Error: ", e);
                    }

                    const welcomeMsg = 
`╔═════════════════════╗
   🌟 **W E L C O M E** 🌟
╚═════════════════════╝

❖ **স্বাগতম প্রিয়:** ${names} 🌸
❖ **বটের নাম:** ARIF BOT
❖ **গ্রুপের নাম:** ${threadName}
❖ **মোট সদস্য:** ${participantCount} জন 👥
❖ **সময়:** ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' })}

━━━━━━━━━━━━━━━━━━━━━━━
💖 **ARIF BOT এর পক্ষ থেকে স্বাগতম!** আশা করি আমাদের আড্ডা আর চ্যাটে প্রতিটি মুহূর্ত দারুণ কাটবে। 

📌 **কিছু নিয়মাবলি:**
 1️⃣ সবাইকে সম্মান করুন।
 2️⃣ অযথা স্প্যাম থেকে বিরত থাকুন।
 3️⃣ সক্রিয় থাকুন। ✨`;

                    await api.sendMessage({
                        body: welcomeMsg,
                        attachment: attachmentStream ? [attachmentStream] : undefined,
                        mentions: mentions
                    }, threadID);

                } catch (error) {
                    console.error("[ WELCOME ERROR ]", error);
                }
            }, 2000);
        }
    }
};
