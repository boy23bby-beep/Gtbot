module.exports.config = {
    name: "help",
    aliases: ["cmds", "commands"],
    version: "3.1",
    author: "ARIF",
    countDown: 5,
    role: 0,
    description: "Show all commands with pagination via reply",
    category: "info",
    guide: { en: "{pn} or {pn} <command name>" }
};

module.exports.onStart = async ({ api, event, args, prefix }) => {
    try {
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

        const allCommands = [];
        for (const [, cmd] of commands) {
            allCommands.push(cmd.config.name);
        }

        const itemsPerPage = 20;
        const totalPages = Math.ceil(allCommands.length / itemsPerPage);
        let page = 1;

        const renderPage = (pageNum) => {
            const start = (pageNum - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const chunk = allCommands.slice(start, end);

            let text = `╔══════════════════╗\n║   ARIF BOT MENU   ║\n╚══════════════════╝\n\n`;
            text += `Total: ${commands.size} commands | Page: ${pageNum}/${totalPages}\n\n`;
            text += chunk.map(n => `↪ ${n}`).join("\n") + "\n\n";
            text += `Type ${pfx}help <command> for details.\n`;
            text += `👉 পেজ বদলাতে এই মেসেজে Reply করে "next" বা "prev" লিখুন।`;
            return text;
        };

        const initialText = renderPage(page);
        
        api.sendMessage(initialText, event.threadID, (err, info) => {
            if (err) return api.sendMessage(`🐛 [DEBUG ONSTART ERR]: ${JSON.stringify(err)}`, event.threadID);
            
            // হ্যান্ডলার ফাইল যে নামে ডেটা খুঁজবে (Reply), ঠিক সেভাবেই ম্যাপে সেট করা হলো
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                author: event.senderID,
                allCommands,
                page,
                totalPages,
                itemsPerPage,
                pfx,
                commandsSize: commands.size
            });
        }, event.messageID);

    } catch (e) {
        api.sendMessage(`🐛 [DEBUG CATCH ERR]: ${e.stack || e.message}`, event.threadID);
    }
};

// হ্যান্ডলার ফাইল থেকে যেহেতু `Reply` পাস হচ্ছে, তাই এখানে `Reply` রিসিভ করতে হবে
module.exports.onReply = async ({ api, event, Reply }) => {
    try {
        if (!Reply) return api.sendMessage(`🐛 [DEBUG REPLY ERR]: Reply object is undefined!`, event.threadID);

        const { author, allCommands, page, totalPages, itemsPerPage, pfx, commandsSize } = Reply;

        if (author && event.senderID !== author) {
            return api.sendMessage("⚠️ আপনি এই মেনুটির মালিক নন!", event.threadID, event.messageID);
        }

        const replyText = event.body ? event.body.trim().toLowerCase() : "";
        let newPage = page;

        if (replyText === "next" || replyText === "n") {
            newPage++;
            if (newPage > totalPages) newPage = 1;
        } else if (replyText === "prev" || replyText === "p") {
            newPage--;
            if (newPage < 1) newPage = totalPages;
        } else if (!isNaN(replyText) && replyText !== "") {
            const num = parseInt(replyText);
            if (num >= 1 && num <= totalPages) {
                newPage = num;
            } else {
                return api.sendMessage(`❌ ১ থেকে ${totalPages} এর মধ্যে পেজ নাম্বার লিখুন।`, event.threadID, event.messageID);
            }
        } else {
            return;
        }

        const start = (newPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const chunk = allCommands.slice(start, end);

        let text = `╔══════════════════╗\n║   ARIF BOT MENU   ║\n╚══════════════════╝\n\n`;
        text += `Total: ${commandsSize} commands | Page: ${newPage}/${totalPages}\n\n`;
        text += chunk.map(n => `↪ ${n}`).join("\n") + "\n\n";
        text += `Type ${pfx}help <command> for details.\n`;
        text += `👉 পেজ বদলাতে এই মেসেজে Reply করে "next" বা "prev" লিখুন।`;

        const targetMessageID = event.messageReply.messageID;

        api.editMessage(text, targetMessageID, (err, info) => {
            if (err) return api.sendMessage(`🐛 [DEBUG EDIT ERR]: ${JSON.stringify(err)}`, event.threadID);

            // পেজ পরিবর্তন হওয়ার পর নতুন পেজ নম্বর সহ আবার ম্যাপ আপডেট করা হলো
            global.GoatBot.onReply.set(targetMessageID, {
                ...Reply,
                page: newPage
            });
        });

    } catch (e) {
        api.sendMessage(`🐛 [DEBUG ONREPLY CATCH]: ${e.stack || e.message}`, event.threadID);
    }
};
