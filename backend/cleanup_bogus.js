const { MongoClient } = require('mongodb');

async function cleanup() {
  const client = await MongoClient.connect('mongodb+srv://bikujamwal_db_user:wQ3JRSHZYnOD2WXF@pharmatracking.fyikdxd.mongodb.net/?appName=PharmaTracking');
  
  // Find correct db
  const adminDb = client.db('admin');
  const dbs = await adminDb.admin().listDatabases();
  const dbName = dbs.databases.find(d => d.name.toLowerCase().includes('pharma'))?.name || 'test';
  const targetDb = client.db(dbName);
  
  console.log('Connected to DB:', dbName);

  // Find the bogus product
  const badProduct = await targetDb.collection('products').findOne({ productName: 'ajdla' });
  
  if (badProduct) {
    console.log('Found bogus product:', badProduct._id);
    // Delete product
    await targetDb.collection('products').deleteOne({ _id: badProduct._id });
    console.log('Deleted product.');
    
    // Find bills containing this product
    const badBills = await targetDb.collection('bills').find({
      'items.productId': badProduct._id
    }).toArray();
    
    console.log(`Found ${badBills.length} bad bills.`);
    for (const bill of badBills) {
      await targetDb.collection('bills').deleteOne({ _id: bill._id });
      console.log('Deleted bill:', bill.billNumber);
      
      // Also delete stock history for this bill
      await targetDb.collection('stockhistories').deleteMany({ referenceId: bill._id });
      console.log('Deleted related stock history.');
    }
  } else {
    console.log('Bogus product not found. Looking for bills with ajdla manually...');
    
    const badBillsByName = await targetDb.collection('bills').find({
      'items.productName': 'ajdla'
    }).toArray();
    
    console.log(`Found ${badBillsByName.length} bad bills by name.`);
    for (const bill of badBillsByName) {
      await targetDb.collection('bills').deleteOne({ _id: bill._id });
      console.log('Deleted bill:', bill.billNumber);
    }
  }

  console.log('Cleanup complete!');
  client.close();
  process.exit(0);
}

cleanup().catch(console.error);
