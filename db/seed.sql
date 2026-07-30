INSERT INTO customers (name, email, tier, created_at) VALUES
  ('Ava Chen', 'ava@example.com', 'premium', '2026-01-04T09:00:00Z'),
  ('Noah Singh', 'noah@example.com', 'standard', '2026-01-08T10:30:00Z'),
  ('Maya Patel', 'maya@example.com', 'enterprise', '2026-01-10T13:15:00Z');

INSERT INTO products (sku, name, unit_price_cents, active) VALUES
  ('SKU-BOARD-001', 'Planning Board', 2499, 1),
  ('SKU-LAMP-002', 'Desk Lamp', 4599, 1),
  ('SKU-CHAIR-003', 'Ergo Chair', 18999, 1),
  ('SKU-CABLE-004', 'USB-C Cable', 1299, 1);

INSERT INTO orders (customer_id, status, order_date, notes) VALUES
  (1, 'paid', '2026-02-01T12:00:00Z', 'Priority customer'),
  (2, 'new', '2026-02-02T14:20:00Z', 'Needs address confirmation'),
  (3, 'shipped', '2026-02-03T16:40:00Z', 'Enterprise onboarding kit');

INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES
  (1, 1, 2, 2499),
  (1, 4, 3, 1299),
  (2, 2, 1, 4599),
  (3, 3, 4, 18999),
  (3, 1, 4, 2499);

INSERT INTO audit_logs (entity_type, entity_id, event_type, message, created_at) VALUES
  ('order', 1, 'created', 'Order imported from legacy desk', '2026-02-01T12:00:01Z'),
  ('order', 1, 'status_changed', 'Order moved to paid', '2026-02-01T12:05:00Z'),
  ('order', 3, 'status_changed', 'Order shipped from warehouse', '2026-02-04T08:30:00Z');
