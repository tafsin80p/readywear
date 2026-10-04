const mongoose = require('mongoose'); 
mongoose.connect('mongodb+srv://mohimmolla020_db_user:nDN6MxTQRtIiq1w7@cluster0.olmbtiz.mongodb.net/mehzinoffer?appName=Cluster0').then(async () => { 
  const db = mongoose.connection.db; 
  const products = await db.collection('products').find({ status: 'published' }).toArray();
  console.log('Published Products by Category:');
  const grouped = {};
  for(let p of products) {
    if(!grouped[p.category]) grouped[p.category] = 0;
    grouped[p.category]++;
  }
  console.log(grouped);
  process.exit(0); 
});
