const mongoose = require('mongoose'); 
mongoose.connect('mongodb+srv://mohimmolla020_db_user:nDN6MxTQRtIiq1w7@cluster0.olmbtiz.mongodb.net/mehzinoffer?appName=Cluster0').then(async () => { 
  const db = mongoose.connection.db; 
  const c = await db.collection('categories').find({slug: {$in: ['saree', 'dress', 'panjabi', 'baby-dress', 'combo-offer']}}).toArray(); 
  console.log('Categories:', c.map(cat => ({name: cat.name, slug: cat.slug, parent: cat.parentCategory, active: cat.isActive}))); 
  process.exit(0); 
});
