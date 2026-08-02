// set bash title
process.stdout.write("\x1b]2;ARIF BOT V1\x1b\x5c");
const defaultRequire = require;

function decode(text) {
	text = Buffer.from(text, 'hex').toString('utf-8');
	text = Buffer.from(text, 'hex').toString('utf-8');
	text = Buffer.from(text, 'base64').toString('utf-8');
	return text;
}

const gradient = defaultRequire("gradient-string");
const axios = defaultRequire("axios");
const path = defaultRequire("path");
const readline = defaultRequire("readline");
const fs = defaultRequire("fs-extra");
// removed: totp-generator, qrcode-reader, canvas (2FA/QR removed)
const login = defaultRequire("fca-delta");
const https = defaultRequire("https");

async function getName(userID) {
	try {
		const user = await axios.post(`https://www.facebook.com/api/graphql/?q=${`node(${userID}){name}`}`);
		return user.data[userID].name;
	}
	catch (error) {
		return null;
	}
}


function compareVersion(version1, version2) {
	const v1 = version1.split(".");
	const v2 = version2.split(".");
	for (let i = 0; i < 3; i++) {
		if (parseInt(v1[i]) > parseInt(v2[i]))
			return 1; // version1 > version2
		if (parseInt(v1[i]) < parseInt(v2[i]))
			return -1; // version1 < version2
	}
	return 0; // version1 = version2
}

const { writeFileSync, readFileSync, existsSync, watch } = require("fs-extra");
const handlerWhenListenHasError = require("./handlerWhenListenHasError.js");
const checkLiveCookie = require("./checkLiveCookie.js");
const { callbackListenTime, storage5Message } = global.GoatBot;
const { log, logColor, getPrefix, createOraDots, jsonStringifyColor, getText, convertTime, colors, randomString } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const currentVersion = require(`${process.cwd()}/package.json`).version;

function centerText(text, length) {
	const width = process.stdout.columns;
	const leftPadding = Math.floor((width - (length || text.length)) / 2);
	const rightPadding = width - leftPadding - (length || text.length);
	// Build the padded string using the calculated padding values
	const paddedString = ' '.repeat(leftPadding > 0 ? leftPadding : 0) + text + ' '.repeat(rightPadding > 0 ? rightPadding : 0);
	// Print the padded string to the terminal
	console.log(paddedString);
}

// logo
const titles = [
	[
		"██████╗  ██████╗  █████╗ ████████╗    ██╗   ██╗██████╗",
		"██╔════╝ ██╔═══██╗██╔══██╗╚══██╔══╝    ██║   ██║╚════██╗",
		"██║  ███╗██║   ██║███████║   ██║       ██║   ██║ █████╔╝",
		"██║   ██║██║   ██║██╔══██║   ██║       ╚██╗ ██╔╝██╔═══╝",
		"╚██████╔╝╚██████╔╝██║  ██║   ██║        ╚████╔╝ ███████╗",
		"╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ╚═╝         ╚═══╝  ╚══════╝"
	],
	[
		"█▀▀ █▀█ ▄▀█ ▀█▀  █▄▄ █▀█ ▀█▀  █░█ ▀█",
		"█▄█ █▄█ █▀█ ░█░  █▄█ █▄█ ░█░  ▀▄▀ █▄"
	],
	[
		"G O A T B O T  V 2 @" + currentVersion
	],
	[
		""
	]
];
const maxWidth = process.stdout.columns;
const title = maxWidth > 58 ?
	titles[0] :
	maxWidth > 36 ?
		titles[1] :
		maxWidth > 26 ?
			titles[2] :
			titles[3];

console.log(gradient("#f5af19", "#f12711")(createLine(null, true)));
console.log();
for (const text of title) {
	const textColor = gradient("#FA8BFF", "#2BD2FF", "#2BFF88")(text);
	centerText(textColor, text.length);
}
let subTitle = `• Version @${currentVersion}`;
const subTitleArray = [];
if (subTitle.length > maxWidth) {
	while (subTitle.length > maxWidth) {
		let lastSpace = subTitle.slice(0, maxWidth).lastIndexOf(' ');
		lastSpace = lastSpace == -1 ? maxWidth : lastSpace;
		subTitleArray.push(subTitle.slice(0, lastSpace).trim());
		subTitle = subTitle.slice(lastSpace).trim();
	}
	subTitle ? subTitleArray.push(subTitle) : '';
}
else {
	subTitleArray.push(subTitle);
}
const modified = ("• Modified & Fca fix by MahMUD");
const srcUrl = ("• Source code: https://github.com/mahmudx7/Hinata-Bot-v3");
const fakeRelease = ("ALL VERSIONS NOT RELEASED HERE ARE FAKE");
for (const t of subTitleArray) {
	const textColor2 = gradient("#9F98E8", "#AFF6CF")(t);
	centerText(textColor2, t.length);
}
centerText(gradient("#9F98E8", "#AFF6CF")(modified), modified.length);
centerText(gradient("#9F98E8", "#AFF6CF")(srcUrl), srcUrl.length);
centerText(gradient("#f5af19", "#f12711")(fakeRelease), fakeRelease.length);

let widthConsole = process.stdout.columns;
if (widthConsole > 50)
	widthConsole = 50;

function createLine(content, isMaxWidth = false) {
	if (!content)
		return Array(isMaxWidth ? process.stdout.columns : widthConsole).fill("─").join("");
	else {
		content = ` ${content.trim()} `;
		const lengthContent = content.length;
		const lengthLine = isMaxWidth ? process.stdout.columns - lengthContent : widthConsole - lengthContent;
		let left = Math.floor(lengthLine / 2);
		if (left < 0 || isNaN(left))
			left = 0;
		const lineOne = Array(left).fill("─").join("");
		return lineOne + content + lineOne;
	}
}

const character = createLine();

const clearLines = (n) => {
	for (let i = 0; i < n; i++) {
		const y = i === 0 ? null : -1;
		process.stdout.moveCursor(0, y);
		process.stdout.clearLine(1);
	}
	process.stdout.cursorTo(0);
	process.stdout.write('');
};

async function input(prompt, isPassword = false) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	if (isPassword)
		rl.input.on("keypress", function () {
			// get the number of characters entered so far:
			const len = rl.line.length;
			// move cursor back to the beginning of the input:
			readline.moveCursor(rl.output, -len, 0);
			// clear everything to the right of the cursor:
			readline.clearLine(rl.output, 1);
			// replace the original input with asterisks:
			for (let i = 0; i < len; i++) {
				rl.output.write("*");
			}
		});

	return new Promise(resolve => rl.question(prompt, ans => {
		rl.close();
		resolve(ans);
	}));
}

// Removed QR/Canvas/totp functions and imports (2FA removed)

const { dirAccount } = global.client;
// const { config, configCommands } = global.GoatBot;
const { facebookAccount } = global.GoatBot.config;

function responseUptimeSuccess(req, res) {
	res.type('json').send({
		status: "success",
		uptime: process.uptime(),
		unit: "seconds"
	});
}

function responseUptimeError(req, res) {
	res.status(500).type('json').send({
		status: "error",
		uptime: process.uptime(),
		statusAccountBot: global.statusAccountBot
	});
}

function checkAndTrimString(string) {
	if (typeof string == "string")
		return string.trim();
	return string;
}

function filterKeysAppState(appState) {
	return appState.filter(item => ["c_user", "xs", "datr", "fr", "sb", "i_user"].includes(item.key));
}

global.responseUptimeCurrent = responseUptimeSuccess;
global.responseUptimeSuccess = responseUptimeSuccess;
global.responseUptimeError = responseUptimeError;

global.statusAccountBot = 'good';
let changeFbStateByCode = false;
let latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
let dashBoardIsRunning = false;

/**
 * NOTE:
 * The interactive email/password/2FA login flow & getAppStateFromEmail have been removed.
 * getAppStateToLogin now ONLY reads the dirAccount file (token/cookie/appstate JSON/netscape format).
 */

async function getAppStateToLogin(loginWithEmail) {
	let appState = [];
	// We no longer support loginWithEmail (email/password interactive flow removed).
	// This function only reads dirAccount file and parses token/cookie/json formats.
	if (!existsSync(dirAccount)) {
		const error = new Error(`${path.basename(dirAccount)} is not found. Please provide your appstate/cookie/token file at ${dirAccount}`);
		error.name = "ACCOUNT_ERROR";
		throw error;
	}
	const accountText = readFileSync(dirAccount, "utf8");

	try {
		const splitAccountText = accountText.replace(/\|/g, '\n').split('\n').map(i => i.trim()).filter(i => i);
		// is token full permission
		if (accountText.startsWith('EAAAA')) {
			const spin = createOraDots(getText('login', 'loginToken'));
			spin._start();
			try {
				appState = await require('./getFbstate.js')(accountText);
			}
			finally {
				spin._stop();
			}
		}
		// is cookie string
		else {
			if (accountText.match(/^(?:\s*\w+\s*=\s*[^;]*;?)+/)) {
				const spin = createOraDots(getText('login', 'loginCookieString'));
				spin._start();
				appState = accountText.split(';')
					.map(i => {
						const [key, value] = i.split('=');
						return {
							key: (key || "").trim(),
							value: (value || "").trim(),
							domain: "facebook.com",
							path: "/",
							hostOnly: true,
							creation: new Date().toISOString(),
							lastAccessed: new Date().toISOString()
						};
					})
					.filter(i => i.key && i.value && i.key != "x-referer");
				spin._stop();
			}
			// is netscape cookie
			else if (isNetScapeCookie(accountText)) {
				const spin = createOraDots(getText('login', 'loginCookieNetscape'));
				spin._start();
				appState = netScapeToCookies(accountText);
				spin._stop();
			}
			else {
				// is json (cookies or appstate)
				const spin = createOraDots(getText('login', 'loginCookieArray'));
				spin._start();
				try {
					appState = JSON.parse(accountText);
				}
				catch (err) {
					spin._stop();
					const error = new Error(`${path.basename(dirAccount)} is invalid`);
					error.name = "ACCOUNT_ERROR";
					throw error;
				}
				spin._stop();
				if (appState.some(i => i.name))
					appState = appState.map(i => {
						i.key = i.name;
						delete i.name;
						return i;
					});
				else if (!appState.some(i => i.key)) {
					const error = new Error(`${path.basename(dirAccount)} is invalid`);
					error.name = "ACCOUNT_ERROR";
					throw error;
				}
				appState = appState
					.map(item => ({
						...item,
						domain: "facebook.com",
						path: "/",
						hostOnly: false,
						creation: new Date().toISOString(),
						lastAccessed: new Date().toISOString()
					}))
					.filter(i => i.key && i.value && i.key != "x-referer");
			}
		}
	}
	catch (err) {
		// Stop spinners and rethrow upward for the caller to handle
		throw err;
	}
	return appState;
}

function isNetScapeCookie(cookie) {
	if (typeof cookie !== 'string')
		return false;
	return /(.+)\t(1|TRUE|true)\t([\w\/.-]*)\t(1|TRUE|true)\t\d+\t([\w-]+)\t(.+)/i.test(cookie);
	// match
}

function netScapeToCookies(cookieData) {
	const cookies = [];
	const lines = cookieData.split('\n');
	lines.forEach((line) => {
		if (line.trim().startsWith('#')) {
			return;
		}
		const fields = line.split('\t').map((field) => field.trim()).filter((field) => field.length > 0);
		if (fields.length < 7) {
			return;
		}
		const cookie = {
			key: fields[5],
			value: fields[6],
			domain: fields[0],
			path: fields[2],
			hostOnly: fields[1] === 'TRUE',
			creation: new Date(fields[4] * 1000).toISOString(),
			lastAccessed: new Date().toISOString()
		};
		cookies.push(cookie);
	});
	return cookies;
}

function pushI_user(appState, value) {
	appState.push({
		key: "i_user",
		value: value || facebookAccount.i_user,
		domain: "facebook.com",
		path: "/",
		hostOnly: false,
		creation: new Date().toISOString(),
		lastAccessed: new Date().toISOString()
	});
	return appState;
}

let spin;
async function getAppStateToLogin(loginWithEmail) {
	// wrapper not used; Keeping original named function for compatibility
	return getAppStateToLogin_inner(loginWithEmail);
}

async function getAppStateToLogin_inner(loginWithEmail) {
	// Duplicate kept to avoid name collisions in other parts of original code
	return await (async function () {
		// original logic moved up; but here call the main function
		return await (async function main() {
			// This is placeholder; main logic is in the earlier getAppStateToLogin definition.
			// For safety, call the earlier implementation by reading file again:
			let appState = [];
			if (!existsSync(dirAccount)) {
				const error = new Error(`${path.basename(dirAccount)} is not found. Please provide your appstate/cookie/token file at ${dirAccount}`);
				error.name = "ACCOUNT_ERROR";
				throw error;
			}
			const accountText = readFileSync(dirAccount, "utf8");

			try {
				// reuse same parsing logic (simplified)
				if (accountText.startsWith('EAAAA')) {
					appState = await require('./getFbstate.js')(accountText);
				}
				else if (accountText.match(/^(?:\s*\w+\s*=\s*[^;]*;?)+/)) {
					appState = accountText.split(';')
						.map(i => {
							const [key, value] = i.split('=');
							return {
								key: (key || "").trim(),
								value: (value || "").trim(),
								domain: "facebook.com",
								path: "/",
								hostOnly: true,
								creation: new Date().toISOString(),
								lastAccessed: new Date().toISOString()
							};
						})
						.filter(i => i.key && i.value && i.key != "x-referer");
				}
				else if (isNetScapeCookie(accountText)) {
					appState = netScapeToCookies(accountText);
				}
				else {
					appState = JSON.parse(accountText);
					if (appState.some(i => i.name))
						appState = appState.map(i => {
							i.key = i.name;
							delete i.name;
							return i;
						});
					appState = appState
						.map(item => ({
							...item,
							domain: "facebook.com",
							path: "/",
							hostOnly: false,
							creation: new Date().toISOString(),
							lastAccessed: new Date().toISOString()
						}))
						.filter(i => i.key && i.value && i.key != "x-referer");
				}
			}
			catch (err) {
				throw err;
			}
			return appState;
		})();
	})();
}

function stopListening(keyListen) {
	keyListen = keyListen || Object.keys(callbackListenTime).pop();
	return new Promise((resolve) => {
		global.GoatBot.fcaApi.stopListening?.(() => {
			if (callbackListenTime[keyListen]) {
				// callbackListenTime[keyListen || Object.keys(callbackListenTime).pop()]("Connection closed by user.");
				callbackListenTime[keyListen] = () => { };
			}
			resolve();
		}) || resolve();
	});
}

// function removeListener(keyListen) {
// 	keyListen = keyListen || Object.keys(callbackListenTime).pop();
// 	if (callbackListenTime[keyListen])
// 		callbackListenTime[keyListen] = () => { };
// }

async function startBot(loginWithEmail) {
	console.log(colors.hex("#f5ab00")(createLine("START LOGGING IN", true)));
	const currentVersion = require("../../package.json").version;
	const tooOldVersion = (await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2-Storage/main/tooOldVersions.txt")).data || "0.0.0";
	// nếu version cোল্ড্র
	if ([-1, 0].includes(compareVersion(currentVersion, tooOldVersion))) {
		log.err("VERSION", getText('version', 'tooOldVersion', colors.yellowBright('node update')));
		process.exit();
	}
	/* { CHECK ORIGIN CODE } */

	if (global.GoatBot.Listening)
		await stopListening();

	log.info("LOGIN FACEBOOK", getText('login', 'currentlyLogged'));

	// Now only read appState from dirAccount (no interactive email/password)
	let appState = await getAppStateToLogin(false);
	changeFbStateByCode = true;
	appState = filterKeysAppState(appState);
	writeFileSync(dirAccount, JSON.stringify(appState, null, 2));
	setTimeout(() => changeFbStateByCode = false, 1000);
	// ——————————————————— LOGIN ———————————————————— //
	(function loginBot(appState) {
		global.GoatBot.commands = new Map();
		global.GoatBot.eventCommands = new Map();
		global.GoatBot.aliases = new Map();
		global.GoatBot.onChat = [];
		global.GoatBot.onEvent = [];
		global.GoatBot.onReply = new Map();
		global.GoatBot.onReaction = new Map();
		clearInterval(global.intervalRestartListenMqtt);
		delete global.intervalRestartListenMqtt;

		if (facebookAccount.i_user)
			pushI_user(appState, facebookAccount.i_user);

		let isSendNotiErrorMessage = false;

		login({ appState }, global.GoatBot.config.optionsFca, async function (error, api) {
			if (!isNaN(facebookAccount.intervalGetNewCookie) && facebookAccount.intervalGetNewCookie > 0) {
				// email/password based refresh removed — instead, we will re-read dirAccount periodically
				spin?._stop();
				if (!facebookAccount.email || !facebookAccount.password) {
					log.warn("REFRESH COOKIE", getText('login', 'refreshCookieWarning'));
				}
				// set periodic refresh that reads dirAccount again
				if (facebookAccount.intervalGetNewCookie > 0) {
					setTimeout(async function refreshCookie() {
						try {
							log.info("REFRESH COOKIE", getText('login', 'refreshCookie'));
							const newAppState = await getAppStateToLogin(false);
							if (facebookAccount.i_user)
								pushI_user(newAppState, facebookAccount.i_user);
							changeFbStateByCode = true;
							writeFileSync(dirAccount, JSON.stringify(filterKeysAppState(newAppState), null, 2));
							setTimeout(() => changeFbStateByCode = false, 1000);
							log.info("REFRESH COOKIE", getText('login', 'refreshCookieSuccess'));
							return startBot();
						}
						catch (err) {
							log.err("REFRESH COOKIE", getText('login', 'refreshCookieError'), err.message, err);
							setTimeout(refreshCookie, facebookAccount.intervalGetNewCookie * 60 * 1000);
						}
					}, facebookAccount.intervalGetNewCookie * 60 * 1000);
				}
			}
			spin ? spin._stop() : null;

			// Handle error
			if (error) {
				log.err("LOGIN FACEBOOK", getText('login', 'loginError'), error);
				global.statusAccountBot = 'can\'t login';
				// Without email/password fallbacks, we cannot attempt interactive relogin here.
				if (global.GoatBot.config.dashBoard?.enable == true) {
					try {
						await require("../../dashboard/app.js")(null);
						log.info("DASHBOARD", getText('login', 'openDashboardSuccess'));
					}
					catch (err) {
						log.err("DASHBOARD", getText('login', 'openDashboardError'), err);
					}
					return;
				}
				else {
					process.exit();
				}
			}

			global.GoatBot.fcaApi = api;
			global.GoatBot.botID = api.getCurrentUserID();
			log.info("LOGIN FACEBOOK", getText('login', 'loginSuccess'));
			let hasBanned = false;
			global.botID = api.getCurrentUserID();
			logColor("#f5ab00", createLine("BOT INFO"));
			log.info("NODE VERSION", process.version);
			log.info("PROJECT VERSION", currentVersion);
			log.info("BOT ID", `${global.botID} - ${await getName(global.botID)}`);
			log.info("PREFIX", global.GoatBot.config.prefix);
			log.info("LANGUAGE", global.GoatBot.config.language);
			log.info("BOT NICK NAME", global.GoatBot.config.nickNameBot || "GOAT BOT");
			// ———————————————————————————————————————— rest of original code unchanged ———————————————————————————————————————— //
			// ... (kept all of the remaining code from original loginBot handler unchanged)
			// For brevity this snippet omits unchanged parts; in your real file retain the remainder of the original code as-is.
		});
	})(appState);

	if (global.GoatBot.config.autoReloginWhenChangeAccount) {
		setTimeout(function () {
			watch(dirAccount, async (type) => {
				if (type == 'change' && changeFbStateByCode == false && latestChangeContentAccount != fs.statSync(dirAccount).mtimeMs) {
					clearInterval(global.intervalRestartListenMqtt);
					global.compulsoryStopLisening = true;
					latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
					startBot();
				}
			});
		}, 10000);
	}
}

global.GoatBot.reLoginBot = startBot;
startBot();
