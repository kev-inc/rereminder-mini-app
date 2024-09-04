if (!process.env.BOT_TOKEN) {
  throw new Error('Invalid/Missing environment variable: "BOT_TOKEN"');
}

const token = process.env.BOT_TOKEN;

export const sendTelegramMessage = async (
  chatId: string,
  message: string,
  markup?: any
) => {
  const formattedMessage = formatMessage(message);
  const params = genTelegramPayload(chatId, formattedMessage, null, markup);
  const url = genTelegramSendUrl(params);
  return await sendMessage(url);
};

const genTelegramPayload = (
  chatId: string,
  text: string,
  messageId: string | null,
  replyMarkup: any
) => {
  const params = new URLSearchParams({
    chat_id: chatId,
    text: text,
    parse_mode: "MarkdownV2",
  });
  if (messageId) {
    params.append("message_id", messageId);
  }
  if (replyMarkup) {
    params.append(
      "reply_markup",
      decodeURIComponent(JSON.stringify(replyMarkup))
    );
  }
  return params;
};

const genTelegramSendUrl = (params: any) => {
  return `https://api.telegram.org/bot${token}/sendMessage?` + params;
};

export const sendMessage = async (url: string) => {
  const data = await fetch(url).then((resp) => resp.json());
  console.log({ url: url, resp: data });
  return data;
};

const formatMessage = (message: string) => {
  return message
    .replaceAll("_", "\\_")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
    .replaceAll("~", "\\~")
    .replaceAll(">", "\\>")
    .replaceAll("#", "\\#")
    .replaceAll("+", "\\+")
    .replaceAll("-", "\\-")
    .replaceAll("=", "\\=")
    .replaceAll("|", "\\|")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll(".", "\\.")
    .replaceAll("!", "\\!");
};
