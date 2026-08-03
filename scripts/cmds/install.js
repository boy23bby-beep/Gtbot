const { exec } = require("child_process");

module.exports.config = {
    name: "install",
    version: "1.0",
    author: "ARIF",
    countDown: 10,
    role: 2,
    description: "Install an npm package",
    category: "admin",
    guide: { en: "{pn} <package-name>" }
};

module.exports.onStart = async ({ api, event, args }) => {
    if (!args[0]) return api.sendMessage("❌ Please provide a package name.\nUsage: install <package>", event.threadID, event.messageID);
    const pkg = args[0].replace(/[^a-zA-Z0-9@/_\-\.]/g, "");
    const msg = await new Promise(r => api.sendMessage(`📦 Installing ${pkg}...`, event.threadID, (e, i) => r(i), event.messageID));
    exec(`npm install ${pkg} --save`, (err, stdout, stderr) => {
        const text = err
            ? `❌ Failed to install ${pkg}:\n${stderr?.slice(0, 300) || err.message}`
            : `✅ Installed ${pkg} successfully!`;
        api.editMessage(text, msg.messageID);
    });
};
