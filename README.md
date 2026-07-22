# Suraksha Cover — Insurance Management Platform (Java edition)

Backend rewritten in **Java 21 + Spring Boot 3**, matching the original project brief. Frontend is unchanged (React + Tailwind + Framer Motion) with field names adjusted to match Spring's camelCase JSON output.

## ⚠️ Important — this hasn't been compiled yet
I wrote this backend by hand in a sandbox that can only reach npm/pip registries, not Maven Central, so `mvn compile` couldn't actually run here (confirmed: it fails with a 403 from `repo.maven.apache.org`). I reviewed every file for correctness, but **you'll hit the first real compiler check when you open this in IntelliJ**. If something doesn't compile, paste me the error and I'll fix it immediately — that's normal for a project this size written blind.

## Stack
- **Backend:** Java 21, Spring Boot 3.3, Spring Data JPA (Hibernate), Spring Security + JWT (jjwt), Maven, PostgreSQL, SpringDoc OpenAPI (Swagger)
- **Frontend:** React (Vite), Tailwind CSS v4, Framer Motion, Chart.js, React Router

## 1. Database
Use a free PostgreSQL instance (e.g. [Neon](https://neon.tech)). Grab the host, database name, username, and password.

## 2. Backend setup (IntelliJ)
1. Open `backend/` as a Maven project in IntelliJ — it will download dependencies from Maven Central (this works fine on your machine, just not in this sandbox).
2. Set environment variables (Run → Edit Configurations → Environment variables), using `.env.example` as reference:
   ```
   DATABASE_URL=jdbc:postgresql://<host>:5432/<dbname>
   DATABASE_USERNAME=<user>
   DATABASE_PASSWORD=<password>
   JWT_SECRET=<any long random string>
   SEED_ENABLED=true
   ```
3. Run `SurakshaCoverApplication.java`. Hibernate (`ddl-auto=update`) creates all tables automatically on first run — no separate migration step needed. With `SEED_ENABLED=true`, demo accounts are inserted on startup (only if the `users` table is empty).

Demo accounts (password: `Password@123`):
- `admin@surakshacover.in`
- `agent@surakshacover.in`
- `customer@surakshacover.in`

API runs at `http://localhost:5000/api`. Swagger UI: `http://localhost:5000/api/docs`.

**OTP in dev mode:** leave `RESEND_API_KEY` / `TWOFACTOR_API_KEY` unset — the 6-digit login OTP prints to the console instead.

## 3. Frontend setup
```bash
cd frontend
cp .env.example .env   # points to http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
```

## What's mocked vs. real
| Feature | Status |
|---|---|
| Auth, JWT, RBAC, PostgreSQL (via JPA) | Should work — untested, see warning above |
| Customers, policies, claims, payments CRUD | Implemented |
| Document upload | Local disk storage under `backend/uploads/`, served at `/api/uploads/...` |
| Email OTP (Resend) | Mocked — logs to console until `RESEND_API_KEY` is set |
| SMS OTP (2Factor.in) | Mocked — logs to console until `TWOFACTOR_API_KEY` is set |
| Cloudinary storage | Not wired in — swap into `DocumentService.java` when you have credentials |

## Folder structure
```
backend/src/main/java/com/surakshacover/
├── controller/    REST endpoints
├── service/       business logic
├── repository/    Spring Data JPA interfaces
├── entity/        JPA entities (mirrors the DB schema from the project brief)
├── dto/           request/response payloads
├── security/       JWT filter, JWT service
├── config/        Spring Security, CORS, static file serving, data seeder
└── exception/     global error handling
```

## A note on the earlier Node.js version
I initially built this on Node/Express because this sandbox can't reach Maven Central — I should have asked which stack you wanted upfront instead of deciding for you. If you'd like, the Node version is still available and fully tested/working end-to-end; this Java version is the one matching your original brief but needs your local build to confirm it compiles cleanly.
