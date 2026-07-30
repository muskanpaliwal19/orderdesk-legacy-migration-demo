const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

async function getJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function cents(value) {
  return money.format(Number(value || 0) / 100);
}

async function loadOrders() {
  const status = document.querySelector('#statusFilter').value;
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const { orders } = await getJson(`/api/orders${query}`);
  const el = document.querySelector('#orders');
  el.innerHTML = orders.map((order) => `
    <div class="item">
      <strong>#${order.id} ${order.customerName} <span class="status">${order.status}</span></strong>
      <div class="meta">${order.customerEmail} · ${cents(order.totalCents)} · ${new Date(order.orderDate).toLocaleString()}</div>
      ${order.notes ? `<div class="meta">${order.notes}</div>` : ''}
    </div>
  `).join('');
}

async function loadCustomers() {
  const { customers } = await getJson('/api/customers');
  document.querySelector('#customers').innerHTML = customers.map((customer) => `
    <div class="item">
      <strong>${customer.name}</strong>
      <div class="meta">${customer.email} · ${customer.tier}</div>
    </div>
  `).join('');
}

async function loadRevenue() {
  const report = await getJson('/api/reports/revenue');
  document.querySelector('#totalRevenue').textContent = cents(report.totalCents);
}

document.querySelector('#statusFilter').addEventListener('change', loadOrders);
document.querySelector('#customerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await getJson('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(form.entries())),
  });
  event.currentTarget.reset();
  await loadCustomers();
});

Promise.all([loadOrders(), loadCustomers(), loadRevenue()]).catch((err) => {
  document.body.insertAdjacentHTML('beforeend', `<pre>${err.message}</pre>`);
});
