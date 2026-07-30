# Migration Target

Use this file as the source repo instruction for Gallop's target-state generation.

## Target Stack

- Backend: Java 21, Spring Boot 3, Maven, REST API.
- Frontend: Next.js with TypeScript.
- Database: PostgreSQL.
- Migrations: Flyway.
- Preview shape: two services, `frontend` and `backend`.

## Required Backend API

Implement these endpoints under the `/api` prefix:

- `GET /api/health`
- `GET /api/customers`
- `POST /api/customers`
- `GET /api/products`
- `GET /api/orders?status=<optional>`
- `POST /api/orders`
- `PATCH /api/orders/{id}/status`
- `GET /api/reports/revenue`
- `GET /api/audit-logs`

## Required UI

- Show the revenue total.
- List orders with status filter.
- List customers.
- Add a customer.
- Use relative API calls from the browser.

## Preview Manifest For Generated Repo

The generated repo should include a root `preview.manifest.json` similar to this:

```json
{
  "services": {
    "frontend": { "cwd": "./frontend", "cmd": "npx", "args": ["next", "dev", "--port", "3000"], "port": 3000 },
    "backend": { "cwd": "./backend", "cmd": "./mvnw", "args": ["spring-boot:run", "-Dspring-boot.run.arguments=--server.port=8080"], "port": 8080, "healthCheck": { "path": "/api/health", "timeoutSeconds": 180 } }
  },
  "routes": {
    "/api": { "service": "backend", "stripPrefix": false },
    "/": { "service": "frontend", "stripPrefix": false }
  }
}
```
