module.exports.config = {
  name: "tag",
  version: "2.0.2",
  role: 0,
  credits: "Ariful Islam Sabbir",
  hidden: false,
  usePrefix: true,
  category: "Chat",
  countDown: 2
};

function buildMentions(members, separator = " ") {
  let body = "";
  const mentions = [];

  members.forEach((m, i) => {
    if (i > 0) body += separator;

    const tag = m.tag.startsWith("@")
      ? m.tag
      : `@${m.tag}`;

    mentions.push({
      tag,
      id: String(m.id),
      fromIndex: body.length,
      length: tag.length
    });

    body += tag;
  });

  return { body, mentions };
}

module.exports.onStart = async function ({
  api,
  event,
  args,
  message
}) {

  const {
    threadID,
    type,
    messageReply,
    mentions
  } = event;

  // Reply tag
  if (type === "message_reply" && messageReply) {
    const uid = String(messageReply.senderID);
    let name = "User";
    try {
      const userInfo = await api.getUserInfo(uid);
      name = userInfo[uid]?.name || "User";
    } catch (e) {}

    const data = buildMentions([
      {
        tag: name,
        id: uid
      }
    ]);

    return api.sendMessage(data, threadID);
  }

  // Mention tag
  if (mentions && Object.keys(mentions).length > 0) {

    const list = [];

    for (const id in mentions) {
      let tag = (mentions[id] || "").replace(/^@/, "");
      if (!tag) {
        try {
          const userInfo = await api.getUserInfo(id);
          tag = userInfo[id]?.name || "User";
        } catch (e) {
          tag = "User";
        }
      }

      list.push({
        tag,
        id: String(id)
      });
    }

    const data = buildMentions(list, ", ");

    return api.sendMessage(data, threadID);
  }

  // Tag all (Modified to show @everyone cleanly)
  if (args[0] &&
    ["all", "everyone"].includes(args[0].toLowerCase())
  ) {
    try {

      const threadInfo =
        await api.getThreadInfo(threadID);

      const botID =
        String(api.getCurrentUserID());

      const members =
        (threadInfo.userInfo || [])
        .filter(u => String(u.id) !== botID)
        .map(u => ({
          tag: u.name,
          id: u.id
        }));

      if (!members.length)
        return message.reply("No members found.");

      // এখানে মেসেজে শুধু @everyone দেখাবে, কিন্তু ট্যাগ সবার আইডিতেই পড়বে
      let body = "⚠️ সবাইকে ডাকা হলো: @everyone\n\n";
      const mentions = [];

      members.forEach(m => {
        mentions.push({
          tag: "@everyone",
          id: String(m.id),
          fromIndex: body.indexOf("@everyone"),
          length: 9
        });
      });

      return api.sendMessage({ body, mentions }, threadID);

    } catch (e) {
      return message.reply("❌ Tag all failed");
    }
  }

  return message.reply(
    "⚠️ Reply / mention / tag all ব্যবহার করো"
  );
};
