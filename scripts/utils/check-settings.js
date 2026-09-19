const mongoose = require('mongoose');

require('dotenv').config({ path: '.env.local' });
const uri = process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('integrationsettings');
  const doc = await col.findOne({});
  console.log(JSON.stringify(doc, null, 2));
  mongoose.disconnect();
}

main().catch(console.error);
