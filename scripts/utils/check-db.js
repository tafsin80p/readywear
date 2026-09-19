require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function checkTagline() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found');
    process.exit(1);
  }
  
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const settings = await db.collection('storesettings').findOne();
  console.log('Current storeTagline in DB:', settings?.storeTagline);
  
  process.exit(0);
}

checkTagline().catch(console.error);
