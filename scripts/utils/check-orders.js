const mongoose = require('mongoose');

require('dotenv').config({ path: '.env.local' });
const uri = process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('orders');
  const docs = await col.find({}).sort({createdAt: -1}).limit(5).toArray();
  docs.forEach(doc => {
    console.log(`Order ${doc.orderId}: Telegram Status: ${doc.telegramNotificationStatus}, Error: ${doc.telegramLastError}`);
  });
  mongoose.disconnect();
}

main().catch(console.error);
