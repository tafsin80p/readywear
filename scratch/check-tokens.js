const mongoose = require('mongoose');

async function checkTokens() {
  await mongoose.connect('mongodb+srv://mohimmolla020_db_user:nDN6MxTQRtIiq1w7@cluster0.olmbtiz.mongodb.net/mehzinoffer?appName=Cluster0');
  
  const IntegrationSettings = mongoose.model('IntegrationSettings', new mongoose.Schema({}, { strict: false }));
  
  const settings = await IntegrationSettings.findOne();
  if (settings && settings.toObject().pushNotification) {
    const tokens = settings.toObject().pushNotification.adminFcmTokens;
    console.log("Admin FCM Tokens in DB:", tokens?.length || 0);
    console.log(tokens);
  } else {
    console.log("No push notification settings found");
  }
  process.exit(0);
}

checkTokens();
