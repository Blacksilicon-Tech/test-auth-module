# test-auth-module

## Docker (local development)

Prerequisites: Docker and Docker Compose installed.

1. Build and start services:

```bash
docker-compose up --build
```

2. The API will be available at `http://localhost:3003` and Swagger at `http://localhost:3003/api`.

3. To stop and remove containers:

```bash
docker-compose down
```

Notes:

- The compose file uses `mysql:8` for the database with the root password `password` and database `task_module`. Change these values in `docker-compose.yml` for production.
- The app service will read `RESEND_API_KEY` from your host environment or `.env`. Make sure to provide a valid key before using email sending in the container.
