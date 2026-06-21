const { MongoClient } = require('mongodb');
MongoClient.connect('mongodb://127.0.0.1:27017').then(async client => {
  const db = client.db('pharmatrack');
  const bills = await db.collection('bills').find({}).sort({createdAt: -1}).limit(5).toArray();
  require('fs').writeFileSync('bills.json', JSON.stringify(bills, null, 2));
  client.close();
  process.exit(0);
});
