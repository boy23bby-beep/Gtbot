module.exports = {
    config: {
        name: "pp",
        version: "1.0.8",
        author: "Developer",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "View HD profile picture"
        },
        longDescription: {
             en: "View high-resolution profile picture of your or the tagged user"
        },
        category: "Box Chat",
        guide: {
            en: "{pn} [tag কেউকে] or empty for your pp"
        }
    },

    onStart: async function ({ api, event }) {
        const { threadID, senderID, mentions } = event;
        let targetID = senderID;

        // Mention thikmoto check korar system
        if (mentions && Object.keys(mentions).length > 0) {
            targetID = Object.keys(mentions)[0];
        }

        try {
            api.getUserInfo(targetID, async (err, obj) => {
                if (err || !obj || !obj[targetID]) {
                    return api.sendMessage(`❌ User info pawya jayni!`, threadID);
                }

                const userInfo = obj[targetID];
                const name = userInfo.name || "the user";

                const avatarURL = `https://graph.facebook.com/${targetID}/picture?height=1000&width=1000&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

                const fs = require("fs");
                const path = require("path");
                const axios = require("axios");

                const pathImg = path.join(__dirname, `cache/${targetID}_hd.jpg`);
                
                if (!fs.existsSync(path.join(__dirname, "cache"))) {
                    fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
                }

                const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
                fs.writeFileSync(pathImg, Buffer.from(response.data));

                return api.sendMessage({
                    body: `✨ Here is the HD profile picture of ${name}:`,
                    attachment: fs.createReadStream(pathImg)
                }, threadID, () => fs.unlinkSync(pathImg));
            });

        } catch (error) {
            return api.sendMessage(`❌ Error: ${error.message || error}`, threadID);
        }
    }
};
