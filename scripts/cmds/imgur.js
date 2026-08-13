  module.exports = {
    config: {
        name: "imgur",
        version: "1.0.0",
        author: "Developer",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "Upload image to Imgur",
            bn: "ইমেজ ইimgur-এ আপলোড করুন"
        },
        longDescription: {
            en: "Upload any replied or attached image to Imgur and get the direct link",
            bn: "যেকোনো ছবি বা রিপ্লাই করা ছবি Imgur-এ আপলোড করে ডাইরেক্ট লিংক নিন"
        },
        category: "Utility",
        guide: {
            en: "{pn} [reply to image]"
        }
    },

    onStart: async function ({ api, event }) {
        const { threadID, messageReply, attachments } = event;
        const axios = require("axios");

        let imageURL = "";

        // মেসেজ রিপ্লাই করা হলে সেখান থেকে ছবি নেওয়া
        if (messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
            const att = messageReply.attachments[0];
            if (att.type === "photo" || att.type === "image") {
                imageURL = att.url;
            }
        } 
        // অথবা সরাসরি কমান্ডের সাথে ছবি দেওয়া হলে
        else if (attachments && attachments.length > 0) {
            const att = attachments[0];
            if (att.type === "photo" || att.type === "image") {
                imageURL = att.url;
            }
        }

        if (!imageURL) {
            return api.sendMessage("❌ দয়া করে কোনো ছবিতে রিপ্লাই করুন অথবা ছবি সহ `/imgur` কমান্ডটি ব্যবহার করুন!", threadID);
        }

        try {
            api.sendMessage("⏳ ছবিটি Imgur-এ আপলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...", threadID, async (err, info) => {
                try {
                    // Imgur Anonymous Client ID (পাবলিক এপিআই কি)
                    const clientId = "546c25a59c58ad7"; 

                    const response = await axios.post("https://api.imgur.com/3/image", {
                        image: imageURL,
                        type: "url"
                    }, {
                        headers: {
                            Authorization: `Client-ID ${clientId}`
                        }
                    });

                    if (response.data && response.data.success) {
                        const link = response.data.data.link;
                        
                        return api.editMessage(`✅ Imgur আপলোড সফল হয়েছে!\n\n🔗 Direct Link:\n${link}`, info.messageID, threadID);
                    } else {
                        return api.editMessage("❌ Imgur-এ আপলোড করতে ব্যর্থ হয়েছে!", info.messageID, threadID);
                    }
                } catch (uploadErr) {
                    console.error(uploadErr);
                    return api.editMessage("❌ আপলোড করার সময় একটি ত্রুটি ঘটেছে!", info.messageID, threadID);
                }
            });

        } catch (e) {
            console.error(e);
            return api.sendMessage("❌ কোনো সমস্যা হয়েছে!", threadID);
        }
    }
};
