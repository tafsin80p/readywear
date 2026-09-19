require('dotenv').config({ path: '.env.local' });
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = "8621252035";

async function main() {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "Test message from debug script",
    })
  });
  const data = await response.json();
  console.log(data);
}

main().catch(console.error);
