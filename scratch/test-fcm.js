const mongoose = require('mongoose');
const { initializeApp, getApps, getApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

async function testPush() {
  await mongoose.connect('mongodb+srv://mohimmolla020_db_user:nDN6MxTQRtIiq1w7@cluster0.olmbtiz.mongodb.net/mehzinoffer?appName=Cluster0');
  
  const IntegrationSettings = mongoose.model('IntegrationSettings', new mongoose.Schema({}, { strict: false }));
  const settings = await IntegrationSettings.findOne();
  const pn = settings.toObject().pushNotification;
  
  try {
    const serviceAccount = JSON.parse(pn.serviceAccountJson);
    const app = initializeApp({
      credential: cert(serviceAccount)
    });
    
    const message = {
        notification: {
          title: "Test Push",
          body: "This is a test notification from the CLI",
        },
        webpush: {
          fcmOptions: {
            link: "/admin/orders"
          }
        },
        data: {
          type: "order",
          url: "/admin/orders"
        },
        tokens: pn.adminFcmTokens,
      };
      
    const response = await getMessaging(app).sendEachForMulticast(message);
    console.log("Push sent! Success:", response.successCount, "Failure:", response.failureCount);
    if (response.failureCount > 0) {
        response.responses.forEach((res, idx) => {
            if (!res.success) {
                console.log(`Token ${idx} failed:`, res.error);
            }
        });
    }
  } catch (error) {
    console.error("Failed to send push:", error);
  }
  process.exit(0);
}

testPush();
