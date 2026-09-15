const mongoose = require('mongoose');

const uri = "mongodb+srv://mohimmolla020_db_user:nDN6MxTQRtIiq1w7@cluster0.olmbtiz.mongodb.net/mehzinoffer?appName=Cluster0";

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('integrationsettings');
  const doc = await col.findOne({});
  console.log(JSON.stringify(doc, null, 2));
  mongoose.disconnect();
}

main().catch(console.error);
