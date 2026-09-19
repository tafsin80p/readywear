require('dotenv').config({ path: '.env.local' });
const botToken = process.env.TELEGRAM_BOT_TOKEN;

async function main() {
  const url = `https://api.telegram.org/bot${botToken}/getUpdates`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.ok && data.result) {
    const chats = new Set();
    data.result.forEach((update) => {
      let chat = null;
      if (update.message) chat = update.message.chat;
      else if (update.my_chat_member) chat = update.my_chat_member.chat;
      
      if (chat) {
        chats.add(`ID: ${chat.id}, Type: ${chat.type}, Title/Name: ${chat.title || chat.first_name}`);
      }
    });
    console.log(Array.from(chats).join('\n'));
  } else {
    console.log("No updates or error:", data);
  }
}

main().catch(console.error);
