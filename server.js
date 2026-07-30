const express = require('express');
const path = require('node:path');
const { openDatabase } = require('./db');

const app = express();
const db = openDatabase();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'orderdesk-legacy', database: 'json-backed legacy store', migrationSchema: 'db/schema.mysql.sql' });
});

app.get('/api/customers', (_req, res) => {
  res.json({ customers: db.listCustomers() });
});

app.post('/api/customers', (req, res) => {
  const { name, email, tier = 'standard' } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

  const customer = db.createCustomer({ name, email, tier });
  res.status(201).json({ customer });
});

app.get('/api/products', (_req, res) => {
  res.json({ products: db.listProducts() });
});

app.get('/api/orders', (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : null;
  res.json({ orders: db.listOrders(status) });
});

app.post('/api/orders', (req, res) => {
  const { customerId, notes = '', items = [] } = req.body || {};
  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customerId and at least one item are required' });
  }

  const orderId = db.createOrder({ customerId, notes, items });
  res.status(201).json({ orderId });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!['new', 'paid', 'shipped', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'status must be new, paid, shipped, or cancelled' });
  }

  if (!db.updateOrderStatus(id, status)) return res.status(404).json({ error: 'order not found' });

  res.json({ ok: true });
});

app.get('/api/reports/revenue', (_req, res) => {
  res.json(db.revenueReport());
});

app.get('/api/audit-logs', (_req, res) => {
  res.json({ auditLogs: db.auditLogs() });
});

app.listen(port, () => {
  console.log(`OrderDesk legacy app running on http://localhost:${port}`);
});
