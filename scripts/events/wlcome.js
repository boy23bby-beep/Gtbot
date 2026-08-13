const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "welcome",
		version: "1.0.2",
		author: "ARIFUL",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Send welcome message with image and group info"
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

				for (const participant of addedParticipants) {
					const userID = participant.userFbId;

					// যদি বট নিজে জয়েন করে, তবে ওয়েলকাম দরকার নাই (চাইলে রাখতে পারেন)
					if (userID === botID) {
						await api.sendMessage("🎉 বটসুলভ ধন্যবাদ! গ্রুপে সফলভাবে যুক্ত হয়েছি। সবাই কেমন আছেন?", threadID);
						continue;
					}

					// মেম্বার এবং গ্রুপের তথ্য ফেচ করা
					let userName = participant.fullName;
					if (!userName) {
						const userData = await usersData.get(userID);
						userName = userData?.name || "বন্ধু";
					}

					const threadInfo = await threadsData.get(threadID) || {};
					const threadName = threadInfo.threadName || "এই গ্রুপে";
					const participantCount = threadInfo.participantIDs ? threadInfo.participantIDs.length : "অনেক";

					// ওয়েলকাম মেসেজ (বাংলায় সুন্দর ডেকোরেশন সহ)
					const welcomeMsg = 
`┏━━━ 𝙒𝙀𝙇𝘾𝙊𝙈𝙀 ━━━┓
┣❖ স্বাগতম ${userName}! 🌸
┣❖ গ্রুপ: ${threadName}
┣❖ মোট সদস্য: ${participantCount} জন
┗━━━━━━━━━━━━━━━

💖 আমাদের পরিবারে আপনাকে স্বাগতম! আশা করি আমাদের সাথে আপনার সময়টি দারুণ কাটবে। 

📌 দয়া করে গ্রুপের নিয়মকানুন মেনে চলুন এবং চ্যাটে সক্রিয় থাকুন। ✨`;

					// সুন্দর একটি ওয়েলকাম ব্যানার বা ছবি (আপনি চাইলে লিংক পরিবর্তন করতে পারেন)
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
						console.log("Welcome image download failed, sending text only.");
					}

					// মেসেজ পাঠানো (ছবি এবং ট্যাগ সহ)
					await api.sendMessage({
						body: welcomeMsg,
						attachment: attachmentStream ? [attachmentStream] : undefined,
						mentions: [{ tag: userName, id: userID }]
					}, threadID);
				}
			} catch (error) {
				console.error("[ WELCOME EVENT ERROR ]", error);
			}
		}
	}
};
