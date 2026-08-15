const axios = require("axios");

module.exports = {
  config: {
    name: "set",
    version: "6.2.2",
    author: "Ariful Islam Sabbir",
    countDown: 5,
    role: 2,
    description: "Animated Bot PP & Bio Updater with Message Edit Animation",
    category: "Admin",
    guide: "{pn} [pp | bio]"
  },

  onStart: async function ({ api, event, args, message }) {

    const { type, messageReply, senderID, threadID } = event;

    // Admin Check
    if (!global.GoatBot.config.adminBot.includes(senderID)) {
      return message.reply("⚠️ Access Denied.");
    }

    const action = args[0]?.toLowerCase();
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Smooth Animation using Message Editing (Like Ping Command)
    async function runAnimation(threadID, frames, delay = 1200) {
      if (!threadID) return null;
      let currentMsgID = null;
      
      for (let i = 0; i < frames.length; i++) {
        try {
          if (i === 0) {
            // প্রথম ফ্রেমটি পাঠিয়ে messageID সেভ করা
            const info = await new Promise((resolve) => {
              api.sendMessage(frames[i], threadID, (err, info) => {
                if (err) resolve(null);
                else resolve(info);
              });
            });
            currentMsgID = info?.messageID || info;
          } else if (currentMsgID) {
            // পরের ফ্রেমগুলো একই মেসেজে এডিট করা
            await api.editMessage(frames[i], currentMsgID);
          }
          await sleep(delay);
        } catch (e) {
          console.log("[ BOTSET ANIMATION ERROR ]:", e);
        }
      }
      return currentMsgID;
    }

    // =========================
    // PROFILE PICTURE UPDATE
    // =========================

    if (action === "pp") {
      if (
        type !== "message_reply" ||
        !messageReply.attachments ||
        messageReply.attachments[0]?.type !== "photo"
      ) {
        return message.reply(
          "❌ Please reply to a photo with:\n/botset pp"
        );
      }

      const imgUrl = messageReply.attachments[0].url;

      const frames = [
`╔════════════════════╗
║   🖼️ UPDATE BOT PP  ║
╚════════════════════╝

⏳ Starting Update...
`,
`╔════════════════════╗
║   🖼️ UPDATE BOT PP  ║
╚════════════════════╝

░░░░░░░░░░ 0%

📥 Downloading Image...
`,
`╔════════════════════╗
║   🖼️ UPDATE BOT PP  ║
╚════════════════════╝

███░░░░░░░ 25%

🧠 Processing Image...
`,
`╔════════════════════╗
║   🖼️ UPDATE BOT PP  ║
╚════════════════════╝

██████░░░░ 50%

📡 Connecting Facebook...
`,
`╔════════════════════╗
║   🖼️ UPDATE BOT PP  ║
╚════════════════════╝

████████░░ 75%

⚙️ Updating Profile...
`,
`╔════════════════════╗
║   🖼️ UPDATE BOT PP  ║
╚════════════════════╝

██████████ 100%

✅ STATUS CHECKED
🤖 SABBIR CHAT BOT
`
      ];

      try {
        // Run animation frames
        const animationPromise = runAnimation(threadID, frames, 1200);

        // Download image stream in parallel
        const response = await axios.get(imgUrl, { responseType: 'stream' });
        const imageStream = response.data;

        await animationPromise;

        if (typeof api.changeAvatar === "function") {
          api.changeAvatar(imageStream, "", (err, data) => {
            if (err) {
              console.error("[ BOTSET ERROR ] changeAvatar failed:", err);
              return message.reply(`❌ PP Update Failed:\n${JSON.stringify(err)}`);
            }
            return message.reply("✅ Bot Profile Picture Updated Successfully!");
          });
        } else {
          return message.reply("❌ api.changeAvatar function not found.");
        }

      } catch (err) {
        console.error("[ BOTSET ERROR ] PP Update Error:", err);
        return message.reply(`❌ PP Update Failed:\n${err.message || err}`);
      }
    }

    // =========================
    // BIO UPDATE
    // =========================

    else if (action === "bio") {
      const newBio = args.slice(1).join(" ");

      if (!newBio) {
        return message.reply(
          "❌ Usage:\n/botset bio Your Bio"
        );
      }

      const frames = [
`╔════════════════════╗
║    📝 UPDATE BIO   ║
╚════════════════════╝

⏳ Starting Update...
`,
`╔════════════════════╗
║    📝 UPDATE BIO   ║
╚════════════════════╝

░░░░░░░░░░ 0%

📥 Reading Text...
`,
`╔════════════════════╗
║    📝 UPDATE BIO   ║
╚════════════════════╝

███░░░░░░░ 25%

🧠 Processing Bio...
`,
`╔════════════════════╗
║    📝 UPDATE BIO   ║
╚════════════════════╝

██████░░░░ 50%

📡 Connecting Server...
`,
`╔════════════════════╗
║    📝 UPDATE BIO   ║
╚════════════════════╝

████████░░ 75%

⚙️ Updating Account...
`,
`╔════════════════════╗
║    📝 UPDATE BIO   ║
╚════════════════════╝

██████████ 100%

✅ STATUS CHECKED
🤖 SABBIR CHAT BOT
`
      ];

      try {
        const animationPromise = runAnimation(threadID, frames, 1200);

        if (typeof api.changeBio === "function") {
          await animationPromise;
          await api.changeBio(newBio);
          return message.reply("✅ Bot Bio Updated Successfully!");
        } 
        else {
          return message.reply("❌ Your FCA does not support changing bio (api.changeBio missing).");
        }

      } catch (err) {
        console.error("[ BOTSET ERROR ] Bio Update Error:", err);
        return message.reply(`❌ Bio Update Failed:\n${err.message || err}`);
      }
    }

    // =========================
    // HELP MENU
    // =========================

    else {
      return message.reply(
`╔════════════════════╗
║     🤖 BOTSET      ║
╚════════════════════╝

1️⃣ Reply Photo:
→ /botset pp

2️⃣ Change Bio:
→ /botset bio Your Text
`
      );
    }
  }
};
