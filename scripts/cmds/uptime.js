const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "uptime",
    aliases: ["ut"],
    version: "1.2",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Show how long the bot has been running with an image dashboard",
    category: "info",
    guide: { en: "{pn}" }
};

module.exports.onStart = async ({ api, event }) => {
    try {
        const startTime = global.GoatBot.startTime;
        const ms = Date.now() - startTime;
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);
        
        const uptimeString = `${d}d ${h % 24}h ${m % 60}m ${s % 60}s`;
        
        // মেমোরি ইউজেজ হিসাব
        const usage = process.memoryUsage();
        const totalMem = (usage.heapUsed / 1024 / 1024).toFixed(2);
        
        // ব্যাকগ্রাউন্ড ইমেজের পাথ (আপনার ইমেজটি বটের cache বা assets ফোল্ডারে 'bg.jpg' নামে রাখতে হবে)
        const bgPath = path.join(__dirname, "cache", "bg.jpg");
        
        // যদি ফোল্ডার না থাকে তৈরি করে নেওয়া এবং ইমেজ চেক করা
        if (!fs.existsSync(bgPath)) {
            return api.sendMessage("⚠️ অনুগ্রহ করে আপনার বটের cache ফোল্ডারে ব্যাকগ্রাউন্ড ইমেজটি 'bg.jpg' নামে সেভ করুন!", event.threadID, event.messageID);
        }

        // ক্যানভাস সাইজ নির্ধারণ
        const canvas = createCanvas(1000, 563);
        const ctx = canvas.getContext("2d");

        // ব্যাকগ্রাউন্ড ইমেজ লোড করা
        const background = await loadImage(bgPath);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // ওভারলে বা গ্লাস ইফেক্ট (টেক্সট ভালোভাবে ফুটিয়ে তোলার জন্য হালকা কালার লেয়ার)
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // হেডার বা টাইটেল
        ctx.font = "bold 40px sans-serif";
        ctx.fillStyle = "#00ffff";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 15;
        ctx.fillText("⚡ ARIF BOT DASHBOARD", 80, 100);

        // ইউজার নেম বা সিস্টেম স্ট্যাটাস বক্স ডিজাইন
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(10, 10, 30, 0.6)";
        ctx.strokeStyle = "#9b59b6";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(80, 140, 840, 340, 20);
        ctx.fill();
        ctx.stroke();

        // টেক্সট ইনফরমেশন সেটআপ
        ctx.font = "bold 28px sans-serif";
        ctx.fillStyle = "#ffffff";

        // ইউটিম ইনফো
        ctx.fillText("⏱️ Uptime:", 130, 220);
        ctx.fillStyle = "#00ffcc";
        ctx.fillText(uptimeString, 320, 220);

        // র‍্যাম বা মেমোরি ইউজেজ
        ctx.fillStyle = "#ffffff";
        ctx.fillText("💾 RAM Usage:", 130, 280);
        ctx.fillStyle = "#ff00ff";
        ctx.fillText(`${totalMem} MB`, 320, 280);

        // পিং বা রেসপন্স টাইম
        const ping = Date.now() - event.timestamp;
        ctx.fillStyle = "#ffffff";
        ctx.fillText("🏓 Ping:", 130, 340);
        ctx.fillStyle = "#f1c40f";
        ctx.fillText(`${ping}ms`, 320, 340);

        // বট স্ট্যাটাস
        ctx.fillStyle = "#ffffff";
        ctx.fillText("🤖 Status:", 130, 400);
        ctx.fillStyle = "#2ecc71";
        ctx.fillText("Online & Active", 320, 400);

        // ইমেজ ফাইল সেভ করা
        const imagePath = path.join(__dirname, "cache", `uptime_${event.senderID}.png`);
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(imagePath, buffer);

        // মেসেজ পাঠানো এবং ফাইল ডিলিট করা
        await api.sendMessage({
            body: "✨ এখানে আপনার বটের লাইভ স্ট্যাটাস ড্যাশবোর্ড দেওয়া হলো:",
            attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage(`❌ একটি ত্রুটি ঘটেছে: ${e.message}`, event.threadID, event.messageID);
    }
};
