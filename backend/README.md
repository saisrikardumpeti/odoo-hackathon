Setup Instructions

```sh
npm install
docker run --name odoo-backend -p 5432:5432 -e POSTGRES_DB=stackit -e POSTGRES_PASSWORD=password -d postgres
npm run db:push
npm run dev
```