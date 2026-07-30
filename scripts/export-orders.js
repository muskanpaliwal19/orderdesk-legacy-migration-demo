const fs = require('node:fs');
const path = require('node:path');
const { openDatabase } = require('../db');

const db = openDatabase();
const rows = db.exportOrders();

const outDir = path.join(__dirname, '..', 'exports');
fs.mkdirSync(outDir, { recursive: true });

const csv = [
  'id,customer_email,status,order_date,total_cents',
  ...rows.map((row) => [row.id, row.customerEmail, row.status, row.orderDate, row.totalCents].join(',')),
].join('\n');

const outFile = path.join(outDir, 'orders.csv');
fs.writeFileSync(outFile, csv + '\n');
console.log(`Exported ${rows.length} orders to ${outFile}`);
