const mongoose = require('mongoose');

async function checkConfig() {
  await mongoose.connect('mongodb+srv://mohimmolla020_db_user:nDN6MxTQRtIiq1w7@cluster0.olmbtiz.mongodb.net/mehzinoffer?appName=Cluster0');
  
  const IntegrationSettings = mongoose.model('IntegrationSettings', new mongoose.Schema({}, { strict: false }));
  
  const settings = await IntegrationSettings.findOne();
  if (settings && settings.toObject().pushNotification) {
    const pn = settings.toObject().pushNotification;
    console.log("Service Account JSON configured?", !!pn.serviceAccountJson);
    if (pn.serviceAccountJson) {
      try {
        JSON.parse(pn.serviceAccountJson);
        console.log("Service Account JSON is valid JSON!");
      } catch (e) {
        console.log("Service Account JSON is INVALID JSON!");
      }
    }
  } else {
    console.log("No push notification settings found");
  }
  process.exit(0);
}

checkConfig();
