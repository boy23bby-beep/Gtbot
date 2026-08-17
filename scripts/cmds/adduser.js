const { findUid } = global.utils;
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	config: {
		name: "adduser",
		version: "2.4",
		author: "ARIF",
		countDown: 5,
		role: 1,
		description: {
			en: "Add user with centered premium title, rearranged info, and rich background watermark drawings"
		},
		category: "box chat",
		guide: {
			en: "   {pn} [link profile | uid]"
		}
	},
	langs: {
		en: {
			alreadyInGroup: "Already in group",
			successAdd: "- Successfully added %1 members",
			failedAdd: "- Failed to add %1 members",
			approve: "- Added %1 members to approval list",
			invalidLink: "Please enter a valid facebook link",
			cannotGetUid: "Cannot get uid of this user",
			linkNotExist: "This profile url does not exist",
			cannotAddUser: "Bot is blocked or user blocked strangers"
		}
	},
	onStart: async function ({ message, api, event, args, threadsData, getLang }) {
		const startTime = Date.now();
		if (!args.length) return message.reply("⚠️ Please provide a profile link or UID!");
		
		const threadDataInfo = await threadsData.get(event.threadID);
		const members = threadDataInfo.members || [];
		const adminIDs = threadDataInfo.adminIDs || [];
		const approvalMode = threadDataInfo.approvalMode || false;
		const botID = api.getCurrentUserID();
		
		let threadName = threadDataInfo.threadName || "Box Chat";
		let totalMembersCount = members.length;

		let senderName = "Admin";
		let senderRole = "Member";
		try {
			const senderInfo = await api.getUserInfo(event.senderID);
			if (senderInfo && senderInfo[event.senderID]) senderName = senderInfo[event.senderID].name;
			if (adminIDs.includes(event.senderID)) senderRole = "Admin";
		} catch (e) {}

		let statusType = ""; 
		let statusMessage = "";
		let targetUID = null;
		let failedReason = "";

		function checkErrorAndPush(messageError, item) {
			item = item.replace(/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i, '');
			failedReason = messageError;
			statusType = "failed";
		}

		const regExMatchFB = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;
		
		const item = args[0];
		let uid;
		let hasError = false;

		if (isNaN(item) && regExMatchFB.test(item)) {
			for (let i = 0; i < 10; i++) {
				try {
					uid = await findUid(item);
					break;
				}
				catch (err) {
					if (err.name == "SlowDown" || err.name == "CannotGetData") {
						await sleep(1000);
						continue;
					}
					else if (i == 9 || (err.name != "SlowDown" && err.name != "CannotGetData")) {
						checkErrorAndPush(
							err.name == "InvalidLink" ? getLang('invalidLink') :
								err.name == "CannotGetData" ? getLang('cannotGetUid') :
									err.name == "LinkNotExist" ? getLang('linkNotExist') :
										err.message,
							item
						);
						hasError = true;
						break;
					}
				}
			}
		}
		else if (!isNaN(item))
			uid = item;
		else {
			hasError = true;
			statusType = "failed";
			statusMessage = getLang('invalidLink');
		}

		if (!hasError) {
			targetUID = uid;
			if (members.some(m => m.userID == uid && m.inGroup)) {
				statusType = "failed";
				statusMessage = getLang("alreadyInGroup");
			}
			else {
				try {
					await api.addUserToGroup(uid, event.threadID);
					if (approvalMode === true && !adminIDs.includes(botID)) {
						statusType = "pending";
						statusMessage = "Added to approval list (Pending)";
					} else {
						statusType = "success";
						statusMessage = "Successfully Added to Group";
					}
				}
				catch (err) {
					statusType = "failed";
					statusMessage = getLang("cannotAddUser");
				}
			}
		} else {
			if (!statusMessage) statusMessage = failedReason || "Failed to process request";
		}

		let targetName = "Facebook User";
		let targetUsername = null;
		let targetGender = null;
		let targetHometown = null;
		let targetFollowers = null;
		let isVerified = false;

		if (targetUID) {
			try {
				const userInfo = await api.getUserInfo(targetUID);
				if (userInfo && userInfo[targetUID]) {
					targetName = userInfo[targetUID].name || "Facebook User";
					if (userInfo[targetUID].vanity) targetUsername = userInfo[targetUID].vanity;
					if (userInfo[targetUID].gender) targetGender = userInfo[targetUID].gender == 2 ? "Male" : userInfo[targetUID].gender == 1 ? "Female" : "Other";
				}
			} catch (e) {}

			try {
				const resUser = await axios.get(`https://graph.facebook.com/${targetUID}?fields=hometown,subscribers_count,verified&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`);
				if (resUser.data) {
					if (resUser.data.hometown) targetHometown = resUser.data.hometown.name;
					if (resUser.data.subscribers_count) targetFollowers = resUser.data.subscribers_count.toLocaleString();
					isVerified = resUser.data.verified || false;
				}
			} catch (e) {}
		}

		const now = new Date();
		const timeString = now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, day: 'numeric', month: 'short', year: 'numeric' });
		const executionTime = Date.now() - startTime;

		// --- CANVAS DASHBOARD GENERATION ---
		try {
			const canvas = createCanvas(1000, 540);
			const ctx = canvas.getContext('2d');

			const bgGradient = ctx.createLinearGradient(0, 0, 1000, 540);
			bgGradient.addColorStop(0, '#0c0c0e');
			bgGradient.addColorStop(0.5, '#17171a');
			bgGradient.addColorStop(1, '#09090b');
			ctx.fillStyle = bgGradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Rich Background Watermark & Geometric Drawings
			ctx.save();
			// Large Watermark Text with higher opacity
			ctx.font = 'bold 90px sans-serif';
			ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.translate(500, 270);
			ctx.rotate(-Math.PI / 12);
			ctx.fillText("POWERED BY", 0, -30);
			ctx.font = 'bold 50px sans-serif';
			ctx.fillText("ARIF BOT", 0, 50);
			ctx.restore();

			// Extra decorative background geometric shapes/lines
			ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(500, 270, 200, 0, Math.PI * 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(500, 270, 320, 0, Math.PI * 2);
			ctx.stroke();

			// Outer Gold Border
			const borderGrad = ctx.createLinearGradient(20, 20, 980, 520);
			borderGrad.addColorStop(0, '#fef08a');
			borderGrad.addColorStop(0.5, '#d4af37');
			borderGrad.addColorStop(1, '#997a15');
			ctx.strokeStyle = borderGrad;
			ctx.lineWidth = 4;
			ctx.strokeRect(20, 20, 960, 500);

			ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
			ctx.fillRect(28, 28, 944, 484);

			// Centered Premium Dashboard Title Header
			ctx.fillStyle = '#fef08a';
			ctx.font = 'bold 28px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText("👑 PREMIUM DASHBOARD", 500, 75);
			ctx.textAlign = 'left'; // Reset alignment

			const lineGrad = ctx.createLinearGradient(50, 95, 950, 95);
			lineGrad.addColorStop(0, '#d4af37');
			lineGrad.addColorStop(0.5, '#fef08a');
			lineGrad.addColorStop(1, '#d4af37');
			ctx.strokeStyle = lineGrad;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(50, 95);
			ctx.lineTo(950, 95);
			ctx.stroke();

			// Avatar
			let avatarX = 145, avatarY = 290, avatarRadius = 85;
			ctx.save();
			ctx.beginPath();
			ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();

			try {
				let avatarUrl = `https://graph.facebook.com/${targetUID || event.senderID}/picture?height=700&width=700&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
				let avatarImg = await loadImage(avatarUrl);
				ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
			} catch (e) {
				ctx.fillStyle = '#27272a';
				ctx.fillRect(avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
			}
			ctx.restore();

			ctx.strokeStyle = '#fef08a';
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
			ctx.stroke();

			// Dynamic Info Rendering
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 24px sans-serif';
			let displayName = targetName.length > 22 ? targetName.substring(0, 22) + "..." : targetName;
			ctx.fillText(displayName, 270, 145);

			if (isVerified) {
				ctx.fillStyle = '#38bdf8';
				ctx.beginPath();
				let nameWidth = ctx.measureText(displayName).width;
				ctx.arc(280 + nameWidth, 137, 9, 0, Math.PI * 2);
				ctx.fill();
			}

			ctx.fillStyle = '#d4d4d8';
			ctx.font = '16px sans-serif';
			
			let currentY = 180;
			const lineHeight = 28;

			if (targetUID) {
				ctx.fillText(`🆔 UID: ${targetUID}`, 270, currentY);
				currentY += lineHeight;
			}
			if (targetUsername) {
				ctx.fillText(`🔗 Username: ${targetUsername}`, 270, currentY);
				currentY += lineHeight;
			}
			if (targetGender) {
				ctx.fillText(`🚻 Gender: ${targetGender}`, 270, currentY);
				currentY += lineHeight;
			}

			// Group Name and Member Count placed right after Gender
			let shortThread = threadName.length > 25 ? threadName.substring(0, 25) + "..." : threadName;
			ctx.fillStyle = '#fef08a';
			ctx.fillText(`💬 Group: ${shortThread} (${totalMembersCount} members)`, 270, currentY);
			currentY += lineHeight;

			ctx.fillStyle = '#d4d4d8';
			if (targetHometown) {
				ctx.fillText(`📍 Hometown: ${targetHometown}`, 270, currentY);
				currentY += lineHeight;
			}
			if (targetFollowers) {
				ctx.fillText(`👥 Followers: ${targetFollowers}`, 270, currentY);
				currentY += lineHeight;
			}

			// Divider line before status
			ctx.strokeStyle = 'rgba(254, 240, 138, 0.2)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(270, currentY + 5);
			ctx.lineTo(930, currentY + 5);
			ctx.stroke();

			currentY += 35;

			// Single Dynamic Status
			ctx.font = 'bold 18px sans-serif';
			if (statusType === "success") {
				ctx.fillStyle = '#fef08a';
				ctx.fillText(`✨ Status: Successfully Added to Group`, 270, currentY);
			} else if (statusType === "pending") {
				ctx.fillStyle = '#60a5fa';
				ctx.fillText(`⏳ Status: Added to Approval List (Pending)`, 270, currentY);
			} else {
				ctx.fillStyle = '#fca5a5';
				ctx.fillText(`❌ Status: Failed (${statusMessage})`, 270, currentY);
			}

			// Footer Info
			ctx.fillStyle = '#a1a1aa';
			ctx.font = 'italic 13px sans-serif';
			ctx.fillText(`Requested by: ${senderName} (${senderRole}) • Time: ${timeString} • Ping: ${executionTime}ms • Arif Bot`, 270, 475);

			const pathName = __dirname + `/cache/add_watermark_v3_${event.threadID}.png`;
			const fs = require('fs');
			if (!fs.existsSync(__dirname + '/cache')) fs.mkdirSync(__dirname + '/cache', { recursive: true });
			fs.writeFileSync(pathName, canvas.toBuffer());

			await message.reply({
				body: ``,
				attachment: fs.createReadStream(pathName)
			});

			setTimeout(() => {
				if (fs.existsSync(pathName)) fs.unlinkSync(pathName);
			}, 10000);

		} catch (canvasErr) {
			console.error(canvasErr);
			await message.reply(statusMessage || "Done processing request!");
		}
	}
};
