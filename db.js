const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, 'data');
const dbPath = process.env.DB_FILE || path.join(dataDir, 'orderdesk.json');

const seedData = {
  customers: [
    { id: 1, name: 'Ava Chen', email: 'ava@example.com', tier: 'premium', createdAt: '2026-01-04T09:00:00Z' },
    { id: 2, name: 'Noah Singh', email: 'noah@example.com', tier: 'standard', createdAt: '2026-01-08T10:30:00Z' },
    { id: 3, name: 'Maya Patel', email: 'maya@example.com', tier: 'enterprise', createdAt: '2026-01-10T13:15:00Z' },
  ],
  products: [
    { id: 1, sku: 'SKU-BOARD-001', name: 'Planning Board', unitPriceCents: 2499, active: 1 },
    { id: 2, sku: 'SKU-LAMP-002', name: 'Desk Lamp', unitPriceCents: 4599, active: 1 },
    { id: 3, sku: 'SKU-CHAIR-003', name: 'Ergo Chair', unitPriceCents: 18999, active: 1 },
    { id: 4, sku: 'SKU-CABLE-004', name: 'USB-C Cable', unitPriceCents: 1299, active: 1 },
  ],
  orders: [
    { id: 1, customerId: 1, status: 'paid', orderDate: '2026-02-01T12:00:00Z', notes: 'Priority customer' },
    { id: 2, customerId: 2, status: 'new', orderDate: '2026-02-02T14:20:00Z', notes: 'Needs address confirmation' },
    { id: 3, customerId: 3, status: 'shipped', orderDate: '2026-02-03T16:40:00Z', notes: 'Enterprise onboarding kit' },
  ],
  orderItems: [
    { id: 1, orderId: 1, productId: 1, quantity: 2, unitPriceCents: 2499 },
    { id: 2, orderId: 1, productId: 4, quantity: 3, unitPriceCents: 1299 },
    { id: 3, orderId: 2, productId: 2, quantity: 1, unitPriceCents: 4599 },
    { id: 4, orderId: 3, productId: 3, quantity: 4, unitPriceCents: 18999 },
    { id: 5, orderId: 3, productId: 1, quantity: 4, unitPriceCents: 2499 },
  ],
  auditLogs: [
    { id: 1, entityType: 'order', entityId: 1, eventType: 'created', message: 'Order imported from legacy desk', createdAt: '2026-02-01T12:00:01Z' },
    { id: 2, entityType: 'order', entityId: 1, eventType: 'status_changed', message: 'Order moved to paid', createdAt: '2026-02-01T12:05:00Z' },
    { id: 3, entityType: 'order', entityId: 3, eventType: 'status_changed', message: 'Order shipped from warehouse', createdAt: '2026-02-04T08:30:00Z' },
  ],
};

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedData));
}

function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function openDatabase() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (process.env.DB_RESET === 'true' && fs.existsSync(dbPath)) {
    fs.rmSync(dbPath);
  }

  let state;
  if (fs.existsSync(dbPath)) {
    state = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } else {
    state = cloneSeed();
    save();
  }

  function save() {
    fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
  }

  function orderTotalCents(orderId) {
    return state.orderItems
      .filter((item) => item.orderId === orderId)
      .reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
  }

  function listOrders(status) {
    return state.orders
      .filter((order) => !status || order.status === status)
      .map((order) => {
        const customer = state.customers.find((c) => c.id === order.customerId);
        return {
          id: order.id,
          status: order.status,
          orderDate: order.orderDate,
          notes: order.notes,
          customerName: customer?.name || 'Unknown customer',
          customerEmail: customer?.email || '',
          totalCents: orderTotalCents(order.id),
        };
      })
      .sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }

  return {
    listCustomers: () => [...state.customers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    createCustomer(input) {
      const customer = { id: nextId(state.customers), ...input, createdAt: new Date().toISOString() };
      state.customers.push(customer);
      save();
      return customer;
    },
    listProducts: () => state.products.filter((product) => product.active === 1).sort((a, b) => a.name.localeCompare(b.name)),
    listOrders,
    createOrder({ customerId, notes = '', items }) {
      const order = { id: nextId(state.orders), customerId, status: 'new', orderDate: new Date().toISOString(), notes };
      state.orders.push(order);
      for (const item of items) {
        const product = state.products.find((p) => p.id === item.productId && p.active === 1);
        if (!product) continue;
        state.orderItems.push({
          id: nextId(state.orderItems),
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          unitPriceCents: product.unitPriceCents,
        });
      }
      state.auditLogs.push({
        id: nextId(state.auditLogs),
        entityType: 'order',
        entityId: order.id,
        eventType: 'created',
        message: 'Order created from legacy UI',
        createdAt: new Date().toISOString(),
      });
      save();
      return order.id;
    },
    updateOrderStatus(id, status) {
      const order = state.orders.find((row) => row.id === id);
      if (!order) return false;
      order.status = status;
      state.auditLogs.push({
        id: nextId(state.auditLogs),
        entityType: 'order',
        entityId: id,
        eventType: 'status_changed',
        message: `Order moved to ${status}`,
        createdAt: new Date().toISOString(),
      });
      save();
      return true;
    },
    revenueReport() {
      const byStatus = Array.from(new Set(state.orders.map((order) => order.status))).sort().map((status) => {
        const orders = state.orders.filter((order) => order.status === status);
        return {
          status,
          orderCount: orders.length,
          totalCents: orders.reduce((sum, order) => sum + orderTotalCents(order.id), 0),
        };
      });
      return { totalCents: byStatus.reduce((sum, row) => sum + row.totalCents, 0), byStatus };
    },
    auditLogs: () => [...state.auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50),
    exportOrders: () => listOrders().sort((a, b) => a.id - b.id),
    close: () => undefined,
  };
}

module.exports = { openDatabase };
