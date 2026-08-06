const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "install",
        version: "1.1.0",
        author: "ariful",
        countDown: 5,
        role: 2, // Admin only (change to 0 if everyone can use)
        shortDescription: "Install/save script dynamically",
        longDescription: "Writes a new command script into the commands directory and reloads it, with debug error logging.",
        category: "owner",
        guide: "{pn} [command_name] [code]"
    },

    onStart: async function ({ api, event, args, message }) {
        const { threadID, messageID } = event;
        
        if (args.length < 2) {
            return message.reply("⚠️ Please provide a command name and the code.\nExample: insrall test console.log('hello');");
        }

        const cmdName = args[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
        let codeContent = args.slice(1).join(" ");

        // Clean up code blocks if user used markdown formatting in chat
        codeContent = codeContent.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();

        const fileName = `${cmdName}.js`;
        const filePath = path.join(__dirname, fileName);

        try {
            // Write the script to the commands directory
            fs.writeFileSync(filePath, codeContent, "utf8");

            // Debug Log: Success writing file
            const debugLog = `[DEBUG - INSTALL]\n- File: ${fileName}\n- Status: Successfully written to disk.\n- Path: ${filePath}`;
            console.log(debugLog);

            // Attempt to reload the command in GoatBot if global client exists
            if (global.client && global.client.commands) {
                try {
                    delete require.cache[require.resolve(filePath)];
                    const pux = require(filePath);
                    if (pux.config && pux.config.name) {
                        global.client.commands.set(pux.config.name, pux);
                    }
                } catch (reloadErr) {
                    console.error("[DEBUG ERROR - RELOAD]", reloadErr);
                }
            }

            return message.reply(`✅ Successfully installed command: **${cmdName}**\n\n\`\`\`text\n${debugLog}\n\`\`\``);

        } catch (error) {
            // Debug Log: Error handling
            const errorLog = `❌ [DEBUG ERROR - INSTALL FAIL]\nFile: ${fileName}\nError: ${error.message}`;
            console.error(errorLog);
            return message.reply(errorLog);
        }
    }
};
