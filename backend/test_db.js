const mongoose = require('mongoose');
require('dotenv').config();

const Bill = require('./src/models/Bill');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pharmatrack');
  const bills = await Bill.find({}).sort('-createdAt').limit(5);
  for (const b of bills) {
    console.log(`\nBill: ${b.billNumber}`);
    console.log(`Total: ${b.totalAmount}, Discount: ${b.discountAmount}`);
    for (const i of b.items) {
      console.log(`  Item: qty ${i.quantity}, buy ${i.purchasePrice}, sell ${i.sellingPrice}, total ${i.total}`);
    }
  }
  process.exit(0);
}

check();
