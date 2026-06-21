const { MongoClient } = require('mongodb');

async function test() {
  const client = await MongoClient.connect('mongodb+srv://bikujamwal_db_user:wQ3JRSHZYnOD2WXF@pharmatracking.fyikdxd.mongodb.net/?appName=PharmaTracking');
  const db = client.db('test'); // Or pharmatrack
  
  // Let's find the correct DB first
  const adminDb = client.db('admin');
  const dbs = await adminDb.admin().listDatabases();
  const dbName = dbs.databases.find(d => d.name.toLowerCase().includes('pharma'))?.name || 'test';
  
  const targetDb = client.db(dbName);
  
  const bills = await targetDb.collection('bills').find({}).toArray();
  
  let totalSales = 0;
  let totalProfit = 0;
  let totalDiscount = 0;
  let totalCost = 0;
  let totalRevenue = 0;
  
  bills.forEach(bill => {
    totalSales += bill.totalAmount;
    
    let billCost = 0;
    let billRevenueWithoutGst = 0;
    
    bill.items.forEach(item => {
      billCost += (item.purchasePrice || 0) * item.quantity;
      billRevenueWithoutGst += (item.sellingPrice || 0) * item.quantity;
    });
    
    const discount = bill.discountAmount || 0;
    totalDiscount += discount;
    totalCost += billCost;
    totalRevenue += billRevenueWithoutGst;
    
    totalProfit += (billRevenueWithoutGst - billCost - discount);
  });
  
  console.log('Total Sales:', totalSales);
  console.log('Total Cost:', totalCost);
  console.log('Total Revenue (excl GST):', totalRevenue);
  console.log('Total Discount:', totalDiscount);
  console.log('Total Profit:', totalProfit);
  
  // Find the bill that caused the most loss
  bills.sort((a, b) => {
    let costA = 0; let revA = 0;
    a.items.forEach(i => { costA += (i.purchasePrice || 0)*i.quantity; revA += (i.sellingPrice || 0)*i.quantity; });
    let profA = revA - costA - (a.discountAmount || 0);
    
    let costB = 0; let revB = 0;
    b.items.forEach(i => { costB += (i.purchasePrice || 0)*i.quantity; revB += (i.sellingPrice || 0)*i.quantity; });
    let profB = revB - costB - (b.discountAmount || 0);
    
    return profA - profB;
  });
  
  const worstBill = bills[0];
  if (worstBill) {
    console.log('\nWorst Bill ID:', worstBill._id);
    console.log('Worst Bill Total Amount:', worstBill.totalAmount);
    console.log('Worst Bill Discount:', worstBill.discountAmount);
    worstBill.items.forEach(i => {
      console.log(`Item: ${i.productName}, Qty: ${i.quantity}, Buy: ${i.purchasePrice}, Sell: ${i.sellingPrice}`);
    });
  }

  process.exit(0);
}

test().catch(console.error);
