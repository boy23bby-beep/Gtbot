const axios = require("axios");

module.exports = {
  config: {
    name: "botset",
    version: "6.2.1",
    author: "Ariful Islam Sabbir",
    countDown: 5,
    role: 2,
    description: "Animated Bot PP & Bio Updater with Guaranteed Message Swap Animation",
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

    // Guaranteed Smooth Animation (Unsend & Send new frame)
    async function runAnimation(threadID, frames, delay = 1200) {
      if (!threadID) return null;
      let currentMsg = null;
      
      for (const frame of frames) {
        try {
          if (currentMsg) {
            await api.unsendMessage(currentMsg);
          }
          const info = await api.sendMessage(frame, threadID);
          // ফ্রেমে messageID পাওয়ার জন্য নিরাপদ হ্যান্ডেলিং
          currentMsg = info.messageID || info;
          await sleep(delay);
        } catch (e) {
          console.log("[ BOTSET ANIMATION ERROR ]:", e);
        }
      }
      return currentMsg;
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
