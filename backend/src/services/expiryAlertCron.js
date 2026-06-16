const cron = require('node-cron');
const Product = require('../models/Product');
const User = require('../models/User');
const Store = require('../models/Store');
const sendEmail = require('./emailService');

const startExpiryAlertCron = () => {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily expiry alert check...');
    
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      // Find all products expiring within 30 days
      const expiringProducts = await Product.find({
        expiryDate: { $gte: today, $lte: thirtyDaysFromNow },
      }).populate('storeId');

      if (expiringProducts.length === 0) return;

      // Group products by store
      const storeProducts = {};
      expiringProducts.forEach((product) => {
        const storeId = product.storeId._id.toString();
        if (!storeProducts[storeId]) {
          storeProducts[storeId] = [];
        }
        storeProducts[storeId].push(product);
      });

      // Send emails to admins of each store
      for (const storeId in storeProducts) {
        const admins = await User.find({ storeId, role: 'admin' });
        
        if (admins.length > 0) {
          const products = storeProducts[storeId];
          const store = products[0].storeId;
          
          let htmlList = '<ul>';
          products.forEach(p => {
            htmlList += `<li>${p.productName} (Batch: ${p.batchNumber}) - Expires on: ${p.expiryDate.toDateString()} - Qty: ${p.quantity}</li>`;
          });
          htmlList += '</ul>';

          const emailHtml = `
            <h2>Expiry Alert for ${store.name}</h2>
            <p>The following products are expiring within the next 30 days:</p>
            ${htmlList}
            <p>Please take necessary actions (return or discount).</p>
          `;

          for (const admin of admins) {
            try {
              await sendEmail({
                email: admin.email,
                subject: `PharmaTrack Alert: Products Expiring Soon`,
                html: emailHtml,
              });
              console.log(`Alert email sent to ${admin.email}`);
            } catch (err) {
              console.error(`Failed to send email to ${admin.email}:`, err);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in expiry alert cron job:', error);
    }
  });
};

module.exports = startExpiryAlertCron;
