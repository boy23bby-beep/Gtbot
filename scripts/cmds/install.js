const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: "installfile",
    version: "1.0",
    author: "ARIF",
    countDown: 10,
    role: 2,
    description: "Download and install a js file from a URL/attachment",
    category: "admin",
    guide: { en: "{pn} <file-name.js> <direct-url> (অথবা ফাইলে রিপ্লাই দিয়ে কমান্ড লিখুন)" }
};

module.exports.onStart = async ({ api, event, args }) => {
    try {
        let fileName = args[0];
        let fileUrl = args[1];

        // যদি কেউ মেসেজে রিপ্লাই দিয়ে কমান্ড লিখে এবং লিংক দেয়
        if (event.type === "message_reply") {
            if (event.messageReply.attachments && event.messageReply.attachments.length > 0) {
                fileUrl = event.messageReply.attachments[0].url;
            }
        }

        if (!fileName || !fileUrl) {
            return api.sendMessage("❌ দয়া করে ফাইলের নাম এবং ডাউনলোড লিংক দিন।\nউদাহরণ: installfile test.js <url>", event.threadID, event.messageID);
        }

        // ফাইলের নাম .js দিয়ে শেষ হচ্ছে কিনা চেক করা
        if (!fileName.endsWith('.js')) {
            fileName += '.js';
        }

        // ফাইলটি কোন ফোল্ডারে সেভ হবে (যেমন: commands ফোল্ডার)
        const targetDir = path.join(__dirname); // বর্তমান কমান্ড ফোল্ডার
        const filePath = path.join(targetDir, fileName);

        const msg = await new Promise(r => api.sendMessage(`📥 ডাউনলোডিং ${fileName}...`, event.threadID, (e, i) => r(i), event.messageID));

        // ফাইল ডাউনলোড করা
        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            api.editMessage(`✅ সফলভাবে ${fileName} ইনস্টল বা সেভ করা হয়েছে!`, msg.messageID);
        });

        writer.on('error', (err) => {
            api.editMessage(`❌ ফাইল সেভ করার সময় ত্রুটি হয়েছে: ${err.message}`, msg.messageID);
        });

    } catch (error) {
        api.sendMessage(`❌ ত্রুটি: ${error.message}`, event.threadID, event.messageID);
    }
};
