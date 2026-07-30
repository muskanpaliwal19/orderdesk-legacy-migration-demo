# Data Wave Brief

This repo is intentionally shaped so Gallop can demonstrate a data wave during modernization.

## Source Data Estate

- Source database shape: SQLite-style schema and seed data in `db/schema.sql` and `db/seed.sql`.
- Runtime store: lightweight JSON file generated under `data/orderdesk.json` so the demo runs without native SQLite dependencies.
- Core entities: `customers`, `products`, `orders`, `order_items`, `audit_logs`.
- Reporting view: `order_totals` aggregates order line totals.
- Legacy export job: `scripts/export-orders.js` emits `exports/orders.csv` for downstream reporting.

## Target Data Estate

- Target database: PostgreSQL managed by the generated Spring Boot application.
- Schema migration: Flyway migrations under `backend/src/main/resources/db/migration`.
- Application persistence: Spring Data JPA repositories or JDBC templates.
- UI consumption: Next.js frontend uses relative API calls to the Spring backend.

## Recommended Data Wave

### Wave 1: Order Core Cutover

Objective: Migrate the order-taking data model and reporting totals from SQLite into Postgres.

Scope:
- Convert SQLite DDL to PostgreSQL DDL.
- Preserve customers, products, orders, order_items, and audit_logs.
- Recreate `order_totals` as either a PostgreSQL view or a Spring report query.
- Seed target Postgres with the same sample rows for preview/demo validation.

Acceptance criteria:
- Row counts match for all five base tables.
- Every `orders.customer_id` points to a valid customer.
- Every `order_items.order_id` and `order_items.product_id` points to a valid parent row.
- Revenue total in the generated app matches the legacy app.
- Order status values remain `new`, `paid`, `shipped`, or `cancelled`.

Out of scope for this wave:
- Historical archive retention beyond `audit_logs`.
- Authentication and authorization.
- Payment provider integration.
