const { execSync } = require("child_process");
const fs = require("fs-extra");
const { createCanvas } = require("canvas");

module.exports.config = {
	name: "install",
	aliases: ["cmd", "addcmd"],
	version: "3.5",
	author: "ARIFUL",
	countDown: 3,
	role: 2,
	description: "Install temporary commands powerfully with an image dashboard",
	category: "system",
	guide: { 
		en: "{pn} <command_name> <code>"
	}
};

if (!global.tempCommands) {
	global.tempCommands = new Map();
}

// Function to create dashboard image
async function createDashboardImage(cmdName, status, loadTime, errorMsg = "") {
	const width = 800;
	const height = 400;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	// Background gradient
	const gradient = ctx.createLinearGradient(0, 0, width, height);
	gradient.addColorStop(0, "#0f172a");
	gradient.addColorStop(1, "#1e1b4b");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);

	// Card container box
	ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
	ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
	ctx.shadowBlur = 20;
	ctx.beginPath();
	ctx.roundRect(40, 40, 720, 320, 20);
	ctx.fill();
	ctx.shadowBlur = 0;

	// Border glow
	ctx.strokeStyle = status === "SUCCESS" ? "#10b981" : "#ef4444";
	ctx.lineWidth = 3;
	ctx.stroke();

	// Header Text
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 26px sans-serif";
	ctx.fillText("⚡ COMMAND INSTALLER DASHBOARD", 80, 100);

	// Divider line
	ctx.strokeStyle = "#334155";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(80, 130);
	ctx.lineTo(720, 130);
	ctx.stroke();

	// Details
	ctx.font = "20px sans-serif";
	ctx.fillStyle = "#94a3b8";
	ctx.fillText("Command Name:", 80, 180);
	ctx.fillText("Execution Status:", 80, 220);
	ctx.fillText("Time Taken:", 80, 260);

	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 20px sans-serif";
	ctx.fillText(cmdName, 260, 180);
	
	ctx.fillStyle = status === "SUCCESS" ? "#10b981" : "#ef4444";
	ctx.fillText(status === "SUCCESS" ? "🟢 ACTIVE (5 Mins)" : "🔴 FAILED", 260, 220);

	ctx.fillStyle = "#f8fafc";
	ctx.fillText(`${loadTime} ms`, 260, 260);

	if (errorMsg) {
		ctx.fillStyle = "#fca5a5";
		ctx.font = "16px sans-serif";
		ctx.fillText(`Error: ${errorMsg.substring(0, 55)}...`, 80, 315);
	} else {
		ctx.fillStyle = "#38bdf8";
		ctx.font = "16px sans-serif";
		ctx.fillText("✨ Command is now active and ready to use!", 80, 315);
	}

	return canvas.toBuffer("image/png");
}

module.exports.onStart = async ({ message, event, args, prefix, commandName }) => {
	if (args.length < 2) {
		return message.reply(`❌ Usage: ${prefix}${commandName} <name> <code>`);
	}

	// [UPDATED] - Automatically removes .js extension and filters invalid characters
	const cmdName = args[0].toLowerCase().replace(/\.js$/, "").replace(/[^a-z0-9_]/g, "");
	
	if (cmdName.length === 0) return message.reply("❌ Invalid command name!");

	let codeContent = args.slice(1).join(" ").replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();

	const startTime = Date.now();
	
	try {
		const m = new module.constructor();
		m.paths = module.paths;
		let preparedCode = codeContent.includes("module.exports") ? codeContent : `module.exports = { ${codeContent} }`;
		m._compile(`${preparedCode};`, `temp_command_${cmdName}.js`);

		const commandObj = m.exports;
		if (!commandObj.config || !commandObj.onStart) throw new Error("Missing config or onStart function!");

		// [UPDATED] - Registers command universally to prevent "commandNotFound"
		global.tempCommands.set(cmdName, commandObj);
		if (global.GoatBot && global.GoatBot.commands) global.GoatBot.commands.set(cmdName, commandObj);
		if (global.client && global.client.commands) global.client.commands.set(cmdName, commandObj);

		setTimeout(() => {
			global.tempCommands.delete(cmdName);
			if (global.GoatBot?.commands) global.GoatBot.commands.delete(cmdName);
			if (global.client?.commands) global.client.commands.delete(cmdName);
		}, 5 * 60 * 1000);

		const loadTime = Date.now() - startTime;
		const imageBuffer = await createDashboardImage(cmdName, "SUCCESS", loadTime);
		
		// [UPDATED] - Ensures the cache directory exists before saving the image
		const cacheDir = __dirname + `/cache`;
		await fs.ensureDir(cacheDir);
		const filePath = `${cacheDir}/${cmdName}_dash.png`;
		await fs.outputFile(filePath, imageBuffer);

		return message.send({
			body: `✅ Command '${cmdName}' installed successfully!`,
			attachment: fs.createReadStream(filePath)
		}, () => fs.unlinkSync(filePath));

	} catch (error) {
		console.error(`[INSTALL COMMAND ERROR] - ${cmdName}:`, error); // Log error to console for debugging
		
		const loadTime = Date.now() - startTime;
		const imageBuffer = await createDashboardImage(cmdName, "FAILED", loadTime, error.message);
		
		const cacheDir = __dirname + `/cache`;
		await fs.ensureDir(cacheDir);
		const filePath = `${cacheDir}/${cmdName}_error.png`;
		await fs.outputFile(filePath, imageBuffer);

		return message.send({
			body: `❌ Installation failed for '${cmdName}'`,
			attachment: fs.createReadStream(filePath)
		}, () => fs.unlinkSync(filePath));
	}
};

module.exports.onChat = async ({ event, message }) => {
	// Re-syncs the commands in chat just to be absolutely sure they stay active
	if (global.tempCommands?.size > 0) {
		for (const [cmdName, cmd] of global.tempCommands.entries()) {
			if (global.GoatBot && global.GoatBot.commands) global.GoatBot.commands.set(cmdName, cmd);
			if (global.client && global.client.commands) global.client.commands.set(cmdName, cmd);
		}
	}
};
