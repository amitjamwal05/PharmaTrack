const mongoose = require('mongoose');
require('./backend/src/models/Product');
require('./backend/src/models/Store');

mongoose.connect('mongodb://127.0.0.1:27017/pharmatrack').then(async () => {
  const Store = mongoose.model('Store');
  const store = await Store.findOne();
  if(!store) {
    console.log('No store found!');
    process.exit(0);
  }
  const Product = mongoose.model('Product');
  const result = await Product.updateMany({ storeId: { $exists: false } }, { $set: { storeId: store._id } });
  console.log('Updated ' + result.modifiedCount + ' products to store ' + store.storeName);
  process.exit(0);
}).catch(console.error);
