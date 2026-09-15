const mongoose = require('mongoose');

const uri = "mongodb+srv://mohimmolla020_db_user:nDN6MxTQRtIiq1w7@cluster0.olmbtiz.mongodb.net/mehzinoffer?appName=Cluster0";

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
