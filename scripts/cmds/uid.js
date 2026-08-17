module.exports = {
    config: {
        name: "uid",
        version: "2.2.1",
        author: "Developer",
        countDown: 5,
      category: "boxchat",
        role: 0,
        shortDescription: {
       
            en: "View UID and Dashboard"
        },
        longDescription: {
            vi: "Gửi UID và ảnh dashboard cùng một lúc",
            en: "Send UID and dashboard image together in a single message"
        },
        category: "Box Chat",
        guide: {
            en: "{pn} [tag কেউকে] or reply to message"
        }
    },
    onStart: async function ({ api, event }) {
        const { threadID, senderID, mentions, messageReply } = event;
        let targetID = senderID;
        if (mentions && Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else if (messageReply) {
            targetID = messageReply.senderID;
        }
        const fs = require("fs");
        const path = require("path");
        const axios = require("axios");
        let botName = "Arif Bot";
        try {
            const configPath = path.join(process.cwd(), "config.json");
            if (fs.existsSync(configPath)) {
                const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
                botName = configData.NickNameBot || configData.botName || configData.name || configData.BOT_NAME || "Arif Bot";
            }
        } catch (e) {}
        try {
            api.getUserInfo(targetID, async (err, obj) => {
                if (err || !obj || !obj[targetID]) {
                    return api.sendMessage(`❌ User info pawya jayni!`, threadID);
                }
                const userInfo = obj[targetID];
                const name = userInfo.name || "Unknown User";
                const avatarURL = `https://graph.facebook.com/${targetID}/picture?height=1000&width=1000&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                const { createCanvas, loadImage, registerFont } = require("canvas");
                const cacheDir = path.join(__dirname, "cache");
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                const fontPath = path.join(cacheDir, "HindSiliguri-Light.ttf");
                if (!fs.existsSync(fontPath)) {
                    try {
                        const fontUrl = "https://github.com/boy23bby-beep/Gtbot/raw/main/func/hindsiligury/HindSiliguri-Light.ttf";
                        const fontBuffer = (await axios.get(fontUrl, { responseType: "arraybuffer" })).data;
                        fs.writeFileSync(fontPath, fontBuffer);
                    } catch (err) {}
                }
                if (fs.existsSync(fontPath)) {
                    registerFont(fontPath, { family: "BanglaFont" });
                }
                const canvas = createCanvas(800, 350);
                const ctx = canvas.getContext("2d");
                const gradient = ctx.createLinearGradient(0, 0, 800, 350);
                gradient.addColorStop(0, "#0f172a");
                gradient.addColorStop(1, "#1e293b");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 4;
                ctx.strokeRect(15, 15, 770, 320);
                ctx.save();
                ctx.beginPath();
                ctx.arc(125, 175, 80, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                try {
                    const avatarBuffer = (await axios.get(avatarURL, { responseType: 'arraybuffer' })).data;
                    const avatarImage = await loadImage(Buffer.from(avatarBuffer));
                    ctx.drawImage(avatarImage, 45, 95, 160, 160);
                } catch (e) { 
                    ctx.fillStyle = "#64748b"; 
                    ctx.fillRect(45, 95, 160, 160); 
                }
                ctx.restore();
                ctx.fillStyle = "#38bdf8";
                ctx.font = "bold 26px Arial";
                ctx.fillText(`POWERED BY: ${botName.toUpperCase()}`, 235, 50);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 24px 'BanglaFont', Arial";
                let displayName = name.length > 22 ? name.substring(0, 20) + "..." : name;
                ctx.fillText(`Name: ${displayName}`, 235, 110);
                ctx.fillStyle = "#94a3b8";
                ctx.font = "20px Arial";
                ctx.fillText(`UID: ${targetID}`, 235, 160);
                ctx.fillText(`Profile: facebook.com/${targetID}`, 235, 200);
                ctx.fillStyle = "#22c55e";
                ctx.beginPath();
                ctx.arc(245, 255, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.font = "bold 16px Arial";
                ctx.fillText("ACTIVE / VERIFIED", 265, 261);
                const imagePath = path.join(cacheDir, `uid_${targetID}.png`);
                fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));
                return api.sendMessage({
                    body: `${targetID}`,
                    attachment: fs.createReadStream(imagePath)
                }, threadID, () => fs.unlinkSync(imagePath));
            });
        } catch (error) {
            console.error(error);
        }
    }
};
