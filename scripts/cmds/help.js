module.exports.config = {
    name: "help",
    aliases: ["cmds", "commands"],
    version: "1.0",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Show all commands or info about a command",
    category: "info",
    guide: { en: "{pn} or {pn} <command name>" }
};

module.exports.onStart = async ({ api, event, args, prefix }) => {
    const { commands } = global.GoatBot;
    const pfx = prefix || global.GoatBot.config.prefix;

    if (args[0]) {
        const name = args[0].toLowerCase();
        const cmd = commands.get(name) || commands.get(global.GoatBot.aliases.get(name));
        if (!cmd) return api.sendMessage(`❌ Command "${name}" not found.`, event.threadID, event.messageID);
        const c = cmd.config;
        const guide = c.guide?.en || "No guide available";
        return api.sendMessage(
            `📌 Command: ${pfx}${c.name}\n` +
            `📝 Description: ${c.description || "N/A"}\n` +
            `📂 Category: ${c.category || "N/A"}\n` +
            `👑 Role: ${c.role === 2 ? "Admin Bot" : c.role === 1 ? "Group Admin" : "Everyone"}\n` +
            `⏱ Cooldown: ${c.countDown}s\n` +
            `📖 Guide: ${guide.replace(/\{pn\}/g, pfx + c.name).replace(/\{p\}/g, pfx)}`,
            event.threadID, event.messageID
        );
    }

    const categories = {};
    for (const [, cmd] of commands) {
        const cat = cmd.config.category || "other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.config.name);
    }

    let text = `╔══════════════════╗\n║   ARIF BOT MENU   ║\n╚══════════════════╝\n\n`;
    Total: ${commands.size} commands\n\n`;
  //  for (const [cat, cmds] of Object.entries(categories).sort()) {
        //text += `━━━ ${cat.toUpperCase()} ━━━\n`;
        text += cmds.map(n => `↪${n}`).join("\n") + "\n\n";
    }
    text += `Type ${pfx}help <command> for details.`;
    api.sendMessage(text, event.threadID, event.messageID);
};
