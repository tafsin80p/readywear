const fs = require('fs');
let env = fs.readFileSync('.env', 'utf8').split('\n').find(l => l.startsWith('MONGODB_URI=')).replace('MONGODB_URI=', '').trim();
if(env.startsWith('"') || env.startsWith("'")) env = env.slice(1, -1);
const { MongoClient } = require('mongodb');
MongoClient.connect(env).then(client => {
  const db = client.db('readywear');
  db.collection('integrationsettings').findOne().then(s => {
    console.log(JSON.stringify(s, null, 2));
    client.close();
  });
}).catch(console.error);
