const axios = require("axios");

module.exports = {
	config: {
		name: "welcome",
		version: "1.0.3",
		author: "ARIFUL",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Send stylish large welcome message with image and group info"
		},
		longDescription: {
			en: "Send stylish bangla welcome message when new members join the group with dashboard and image"
		},
		category: "events",
		guide: {
			en: ""
		}
	},

	onStart: async function({ api, event, threadsData, usersData }) {
		const { threadID, logMessageType, logMessageData } = event;

		if (logMessageType === "log:subscribe") {
			try {
				const addedParticipants = logMessageData.addedParticipants || [];
				const botID = api.getCurrentUserID();

				// রিয়েল-টাইম সঠিক মেম্বার সংখ্যা পাওয়ার জন্য ইনফো রিফ্রেশ করা
				try {
					await threadsData.refreshInfo(threadID);
				} catch (e) {}

				for (const participant of addedParticipants) {
					const userID = participant.userFbId;

					if (userID === botID) {
						await api.sendMessage("🎉 সবাইকে ধন্যবাদ! বট সফলভাবে গ্রুপে যুক্ত হয়েছে। 🤖✨", threadID);
						continue;
					}

					let userName = participant.fullName;
					if (!userName) {
						const userData = await usersData.get(userID);
						userName = userData?.name || "প্রিয় সদস্য";
					}

					const threadInfo = await threadsData.get(threadID) || {};
					const threadName = threadInfo.threadName || "এই চমৎকার গ্রুপে";
					
					// সঠিক সদস্য সংখ্যা বের করার লজিক
					const participantCount = threadInfo.participantIDs ? threadInfo.participantIDs.length : (threadInfo.userInfo ? threadInfo.userInfo.length : "সদস্য");

					// আরও বড় এবং আকর্ষণীয় ডিজাইন করা মেসেজ
					const welcomeMsg = 
`╔═════════════════════╗
   🌟 **W E L C O M E** 🌟
╚═════════════════════╝

❖ **স্বাগতম প্রিয়:** @${userName} 🌸
❖ **গ্রুপের নাম:** ${threadName}
❖ **মোট সদস্য:** ${participantCount} জন 👥
❖ **যোগদানের সময়:** ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' })}

━━━━━━━━━━━━━━━━━━━━━━━
💖 **আমাদের ছোট্ট ও সুন্দর পরিবারে আপনাকে স্বাগতম!** আশা করি আমাদের আড্ডা আর চ্যাটে আপনার প্রতিটি মুহূর্ত দারুণ ও আনন্দময় কাটবে। 

📌 **কিছু গুরুত্বপূর্ণ নিয়মাবলি:**
 1️⃣ সবাইকে সম্মান করুন ও মার্জিত থাকুন।
 2️⃣ অযথা ফ্লাড বা স্প্যাম করা থেকে বিরত থাকুন।
 3️⃣ গ্রুপের প্রতিটি আড্ডায় সক্রিয় থাকুন। ✨

🎉 **শুভকামনা রইল আপনার জন্য!** 🥂`;

					// সুন্দর ওয়েলকাম ব্যানার ইমেজ
					const imgLinks = [
						"https://i.imgur.com/39Q69xH.jpeg",
						"https://i.imgur.com/J33K2b9.jpeg",
						"https://i.imgur.com/83pZ5Xo.jpeg"
					];
					const randomImg = imgLinks[Math.floor(Math.random() * imgLinks.length)];
					
					let attachmentStream = null;
					try {
						const res = await axios.get(randomImg, { responseType: "stream" });
						attachmentStream = res.data;
					} catch (e) {
						console.log("Welcome image download failed.");
					}

					await api.sendMessage({
						body: welcomeMsg,
						attachment: attachmentStream ? [attachmentStream] : undefined,
						mentions: [{ tag: `@${userName}`, id: userID }]
					}, threadID);
				}
			} catch (error) {
				console.error("[ WELCOME EVENT ERROR ]", error);
			}
		}
	}
};
