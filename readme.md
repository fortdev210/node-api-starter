# Express.js + Typescript + Postgres + Prisma

## Features

- TypeScript, Postgres, Express, Prisma configuration
- Basic api creation pattern
- Docker set up for postgres and redis
- Add request validation using [zod](https://www.npmjs.com/package/zod)
- Redis connection
- Logger service using [winston](https://www.npmjs.com/package/winston)
- Swagger for api documentation
- Email transaction using sendgrid
- JWT authentication (Basic user model with email and password, password reset feature)
- Payment setup using stripe
- Twillio setup

### Prisma setup and migrate

- npx prisma generate
- npx prisma migrate dev --name=nameofmigration

#### Create migrations

- Open terminal and use next command
- MIGRATION_NAME="nameofmigration" `yarn db:migrate`
- `yarn db:generate`

### Run Tests Locally

First ensure you have Docker running.

```bash
`docker compose up`
`yarn dev`
```
