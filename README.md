# OrderDesk Legacy Migration Demo

OrderDesk is a small legacy order operations app prepared for a Gallop modernization demo.

The source stack is intentionally simple:

- Node.js and Express backend
- JSON-backed legacy runtime store plus SQLite-shaped SQL schema files
- Vanilla HTML/CSS/JavaScript frontend
- SQL schema and seed files
- Export script that represents a small data workflow

The target requested in Gallop should be:

- Spring Boot backend
- Next.js frontend
- PostgreSQL database
- A data wave for the core order tables

## Run Locally

```bash
npm install
npm run seed
npm start
```

Open `http://localhost:3000`.

## What To Ask Gallop To Do

Use this repo as the source repository and select:

- Source: `Legacy Application`
- Target: `Spring Boot + Next.js`
- Target language: `Java + TypeScript`
- Database target: `PostgreSQL`

Use `DATA_WAVE.md` as the data migration wave brief and `MIGRATION_TARGET.md` as the target implementation contract.

## Demo Scope

The generated application should preserve:

- Customer list and customer creation
- Product catalog
- Order list with status filtering
- Order creation
- Order status updates
- Revenue reporting
- Audit log history

The data wave should convert the SQLite-shaped schema in `db/schema.sql` into Postgres/Flyway migrations and seed equivalent target data from `db/seed.sql`.
