module.exports = {
    config: {
        name: "install",
        version: "2.0.0",
        author: "AI Collaborator",
        countDown: 5,
        role: 2, // শুধু অ্যাডমিনের জন্য
        shortDescription: "মেমোরিতে ১০ মিনিটের জন্য কমান্ড ইনস্টল করুন",
        longDescription: "মেসেঞ্জার থেকে কোড নিয়ে ফাইল সেভ না করে সরাসরি বটের ক্যাশ মেমোরিতে ১০ মিনিটের জন্য রান করায়।",
        category: "owner",
        guide: "{pn} [command_name] [code]"
    },

    onStart: async function ({ api, event, args, message }) {
        if (args.length < 2) {
            return message.reply("⚠️ দয়া করে কমান্ডের নাম এবং কোড দিন।\nউদাহরণ: !install tempcmd module.exports = { config: { name: 'tempcmd' }, onStart: async ({ message }) => message.reply('Temporary!') }");
        }

        const cmdName = args[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
        let codeContent = args.slice(1).join(" ");

        // মেসেঞ্জারের কোড ফরম্যাটিং দূর করা
        codeContent = codeContent
            .replace(/^```[a-z]*\n?/i, "")
            .replace(/```$/, "")
            .trim();

        try {
            // জাভাস্ক্রিপ্ট কোড অবজেক্টে রূপান্তর করার জন্য Module প্রিপারেশন
            const m = new module.constructor();
            m.paths = module.paths;
            m._compile(`module.exports = { ${codeContent.includes("module.exports") ? codeContent.replace("module.exports =", "") : codeContent} };`, 'temp_command.js');

            const commandObj = m.exports;

            if (!commandObj.config || !commandObj.config.name) {
                return message.reply("❌ ত্রুটি: কোডের মধ্যে সঠিক `config.name` পাওয়া যায়নি!");
            }

            const realCmdName = commandObj.config.name.toLowerCase();

            // বটের ক্যাশ মেমোরিতে কমান্ড সেট করা
            if (global.client && global.client.commands) {
                global.client.commands.set(realCmdName, commandObj);
            }

            const debugLog = `[DEBUG - TEMP CACHE SUCCESS]\n- Command: ${realCmdName}\n- Status: Saved in memory\n- Duration: 10 Minutes`;
            console.log(debugLog);

            // ঠিক ১০ মিনিট (৬০০০০০ মিলিভিসেকেন্ড) পর ক্যাশ থেকে ডিলিট করার টাইমার
            setTimeout(() => {
                if (global.client && global.client.commands) {
                    global.client.commands.delete(realCmdName);
                    console.log(`[DEBUG - EXPIRED] Command '${realCmdName}' has been removed from cache after 10 minutes.`);
                }
            }, 10 * 60 * 1000); // ১০ মিনিট

            return message.reply(`✅ Temporary command installed for **10 minutes**!\n\n\`\`\`text\n${debugLog}\n\`\`\``);

        } catch (error) {
            const errorLog = `❌ [DEBUG ERROR - MEMORY FAIL]\nError: ${error.message}`;
            console.error(errorLog);
            return message.reply(errorLog);
        }
    }
};
