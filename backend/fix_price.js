require('dotenv').config();
const mongoose = require('mongoose');

async function fixPrices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require('./src/models/Product');
    const result = await Product.updateMany(
      { sellingPrice: { $exists: false }, price: { $exists: true } },
      { $rename: { "price": "sellingPrice" } }
    );
    console.log('Migration complete:', result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixPrices();
