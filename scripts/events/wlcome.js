const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// আপনার ফেসবুক আইডি বা যে আইডিতে বা গ্রুপে ডিবাগ লগ পাঠাতে চান সেটি এখানে দিন
const ADMIN_UID = "YOUR_ADMIN_FACEBOOK_UID_HERE"; 

async function sendDebugLog(api, message) {
    console.log(message); // বটের কনসোলেও প্রিন্ট হবে
    if (ADMIN_UID && ADMIN_UID !== "61589411307081") {
        try {
            await api.sendMessage(`[DEBUG LOG]\n\n${message}`, ADMIN_UID);
        } catch (e) {
            console.error("[DEBUG ERROR] Failed to send log to admin inbox:", e);
        }
    }
}

module.exports = {
    config: {
        name: "welcome",
        version: "1.6.0",
        author: "ARIFUL",
        countDown: 5,
        role: 0,
        category: "events"
    },

    onStart: async function({ api, event, threadsData }) {
        const { threadID, logMessageType, logMessageData } = event;

        if (logMessageType === "log:subscribe") {
            const botID = api.getCurrentUserID();
            const addedParticipants = logMessageData.addedParticipants || [];

            await sendDebugLog(api, `Event triggered in thread: ${threadID}`);

            if (addedParticipants.some(p => p.userFbId === botID)) {
                await sendDebugLog(api, "Bot added to a new group.");
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

                await sendDebugLog(api, `Processing welcome for ${participants.length} member(s) in thread: ${threadID}`);

                try {
                    const threadInfo = await api.getThreadInfo(threadID);
                    const threadName = threadInfo.threadName || "এই গ্রুপে";
                    const participantCount = threadInfo.participantIDs ? threadInfo.participantIDs.length : (threadInfo.userInfo ? threadInfo.userInfo.length : "সদস্য");

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
                        await sendDebugLog(api, `Loading image from: ${randomImg}`);

                        const image = await loadImage(randomImg);
                        const canvas = createCanvas(image.width, image.height);
                        const ctx = canvas.getContext("2d");

                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                        ctx.fillStyle = "#ffffff";
                        ctx.shadowColor = "black";
                        ctx.shadowBlur = 10;
                        ctx.textAlign = "center";

                        ctx.font = "bold 60px Arial";
                        ctx.fillText("ARIF BOT", canvas.width / 2, 100);

                        ctx.font = "bold 40px Arial";
                        ctx.fillText(`Group: ${threadName}`, canvas.width / 2, 160);

                        ctx.font = "italic 30px Arial";
                        ctx.fillText("Author: Ariful", canvas.width / 2, canvas.height - 50);

                        attachmentStream = canvas.toBuffer();
                        await sendDebugLog(api, "Canvas image generated successfully.");
                    } catch (canvasErr) {
                        await sendDebugLog(api, `Canvas Error: ${canvasErr.message || canvasErr}`);
                    }

                    const welcomeMsg = 
`╔═════════════════════╗
   🌟 WELCOME 🌟
╚═════════════════════╝

❖ স্বাগতম প্রিয়: ${names} 🌸
❖ বটের নাম: ARIF BOT
❖ গ্রুপের নাম: ${threadName}
❖ মোট সদস্য: ${participantCount} জন 👥
❖ সময়: ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' })}

━━━━━━━━━━━━━━━━━━━━━━━
💖 ARIF BOT এর পক্ষ থেকে স্বাগতম! আশা করি আমাদের আড্ডা আর চ্যাটে প্রতিটি মুহূর্ত দারুণ কাটবে। 

📌 কিছু নিয়মাবলি:
1️⃣ সবাইকে সম্মান করুন।
2️⃣ অযথা স্প্যাম থেকে বিরত থাকুন।
3️⃣ সক্রিয় থাকুন। ✨`;

                    await api.sendMessage({
                        body: welcomeMsg,
                        attachment: attachmentStream ? [attachmentStream] : undefined,
                        mentions: mentions
                    }, threadID);

                    await sendDebugLog(api, "Welcome message sent successfully.");

                } catch (error) {
                    await sendDebugLog(api, `Main Execution Error: ${error.message || error}`);
                }
            }, 2000);
        }
    }
};
