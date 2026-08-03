/**
 * Fallback getText factory.
 * Returns readable messages for all known keys, falling back to the key name.
 * Format args (if any) are appended in order using %1, %2... placeholders.
 */

const messages = {
	login: {
		loginSuccess: "Logged in successfully",
		loginError: "Login error: %1",
		loginToken: "Logging in with token...",
		loginCookieString: "Logging in with cookie string...",
		loginCookieNetscape: "Logging in with Netscape cookie...",
		loginCookieArray: "Logging in with cookie array...",
		loginPassword: "Logging in with email/password...",
		loginWith: "Logging in with: %1",
		tokenError: "Token must start with %1. Please check your token in %2",
		cookieError: "Cookie login failed",
		notFoundDirAccount: "Account file not found: %1",
		cannotFindAccount: "Could not determine account login method",
		chooseAccount: "Account",
		chooseToken: "Token",
		chooseCookieString: "Cookie String",
		chooseCookieArray: "Cookie Array (JSON)",
		inputEmail: "Enter email:",
		inputPassword: "Enter password:",
		input2FA: "Enter 2FA code (leave blank if none):",
		inputToken: "Enter token:",
		inputCookieString: "Enter cookie string:",
		inputCookieArray: "Enter cookie array (JSON):",
		notLoggedIn: "Not logged in: %1",
		refreshCookie: "Refreshing cookie...",
		refreshCookieAfter: "Will refresh cookie after %1",
		refreshCookieSuccess: "Cookie refreshed successfully",
		refreshCookieError: "Failed to refresh cookie: %1",
		refreshCookieWarning: "Auto cookie refresh is disabled",
		refreshFbstateSuccess: "Saved new fbstate to %1",
		refreshFbstateError: "Failed to save fbstate to %1",
		openDashboardSuccess: "Dashboard opened successfully",
		openDashboardError: "Failed to open dashboard",
		openServerUptimeSuccess: "Uptime server running at %1",
		openServerUptimeError: "Failed to start uptime server",
		callBackError: "Listen callback error: %1",
		checkGbanError: "Failed to check global ban list",
		gbanMessage: "Account/admin banned since %1 | Reason: %2 | Until: %4",
		youAreBanned: "This account is globally banned. Bot will not start.",
		userBanned: "You are banned from using this bot.",
		restartListenMessage: "Will restart MQTT listener every %1",
		restartListenMessage2: "MQTT listener restarted",
		restartListenMessageError: "Failed to restart MQTT listener: %1",
		retryCheckLiveCookie: "Checking if cookie is still live (retrying in %1s)...",
		runBot: "Bot is running and listening for messages",
		startBotSuccess: "Bot started successfully",
		stopRestartListenMessage: "Stopped MQTT listener restart interval"
	},
	loadData: {
		loadThreadDataSuccess: "Loaded %1 thread(s)",
		loadUserDataSuccess: "Loaded %1 user(s)",
		refreshingThreadData: "Syncing thread data...",
		refreshThreadDataSuccess: "Thread data synced",
		refreshThreadDataError: "Failed to sync thread data"
	},
	loadScripts: {
		loadScriptsError: "Failed to load scripts"
	},
	indexController: {
		connectingMongoDB: "Connecting to MongoDB...",
		connectMongoDBSuccess: "Connected to MongoDB",
		connectMongoDBError: "Failed to connect to MongoDB",
		connectingMySQL: "Connecting to SQLite...",
		connectMySQLSuccess: "Connected to SQLite",
		connectMySQLError: "Failed to connect to SQLite"
	},
	version: {
		tooOldVersion: "Your Node.js version is too old. Please run: %1"
	},
	Goat: {
		autoRestart1: "Auto restart enabled, will restart after %1",
		autoRestart2: "Auto restart scheduled: %1",
		googleApiTokenExpired: "Google API token expired",
		newVersionDetected: "New version available! Current: %1 → Latest: %2 | Run: %3"
	},
	utils: {
		errorOccurred: "An error occurred: %1"
	}
};

/**
 * getText(folder, key, ...args)
 * Returns the message for the given folder/key, substituting %1, %2, etc. with args.
 * Falls back to the key name if not found.
 */
function getText(folder, key, ...args) {
	const template = (messages[folder] && messages[folder][key]) || key;
	return args.reduce((str, arg, i) => str.replace(`%${i + 1}`, arg ?? ''), template);
}

module.exports = getText;
