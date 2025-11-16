# SliqPay Backend

Express + TypeScript API providing auth (signup/login/logout/me), Accounts and Transactions with PostgreSQL (Prisma).

## Tech Stack
- Express (API)
- TypeScript (strict)
- Zod (env + request validation)
- bcryptjs (password hashing)
- jsonwebtoken (JWT access tokens)
- cookie-parser (httpOnly cookie handling)
- pino (logging)
- helmet / cors / morgan (security + logging)
- tsx (dev runner)
- Redis (rate limiting, sessions) with in-memory fallback for local dev

## Project Structure
```
backend/
  package.json
  tsconfig.json
  .env               # not committed
  src/
    config/
      env.ts
    common/
      middleware/
        validate.ts
        auth.ts          # Session+JWT guard (authGuard / optionalAuth)
        notFound.ts
        errorHandler.ts
        rateLimit.ts
      session/
        sessionStore.ts  # Redis-backed sessions (in-memory fallback)
      utils/
        logger.ts
        redis.ts         # Redis client & helpers (in-memory fallback when REDIS_HOST unset)
    modules/
      auth/
        schemas/
        routes/
        controllers/
        services/
      users/
        schemas/
        repositories/
      health/
        controllers/
        routes/
    routes/
      index.ts
    app.ts
    server.ts
```

## Environment
Create `backend/.env` (values below are examples; use your Supabase project credentials):
```
PORT=4000
JWT_SECRET=change_this_to_a_long_random_string_at_least_32_chars
NODE_ENV=development
# PostgreSQL (Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR-PROJECT.supabase.co:5432/postgres?sslmode=require
# Optional: used by Prisma migrate/introspection when a non-pooled direct URL is required
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR-PROJECT.supabase.co:5432/postgres?sslmode=require
# Redis (optional in dev, required in prod)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=
REDIS_TLS=false
# Sessions
SESSION_TTL_SECONDS=604800
SESSION_COOKIE_NAME=sid
# Email
EMAIL_FROM=no-reply@sliqpay.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
# Password Reset
RESET_TOKEN_TTL_SECONDS=900
FRONTEND_URL=http://localhost:3000
```

Note: Supabase requires SSL; keep `sslmode=require` on both URLs.

## Database (Prisma + Supabase)

1) Install deps and generate Prisma client
```
npm install
npm run prisma:generate
```

2) Create and run migrations (first run will create the schema and defaults)
```
npm run prisma:migrate:dev
```

3) For CI/production, deploy migrations
```
npm run prisma:deploy
```

Key behavior implemented:
- New users automatically get an NGN Account seeded with a 25,000 balance.
- Account API creation endpoint also forces starting balance of 25,000.
- Transactions atomically update the account balance (credit adds; debit subtracts with insufficient funds protection).

## Install & Run
From repo root (workspaces):
```
npm install
npm run dev:be
```
Or inside backend:
```
cd backend
npm install
npm run dev
```

Build & start (production style):
```
npm run build
npm start
```

## Scripts
| Script        | Description                       |
|---------------|-----------------------------------|
| dev           | Watch + run via tsx               |
| build         | Compile TypeScript to dist        |
| start         | Run compiled server               |
| prisma:generate | Generate Prisma client          |
| prisma:migrate:dev | Run dev migrations           |
| prisma:deploy | Apply migrations in production    |
| typecheck     | Type-only validation (if added)   |
| lint          | Lint sources (if configured)      |

## API Base
```
http://localhost:4000/api/v1
```

## Endpoints (Current)
| Method | Path                  | Auth | Description                 |
|--------|-----------------------|------|-----------------------------|
| GET    | /health               | none | Liveness check (+ Redis)    |
| POST   | /auth/signup          | none | Create user (returns cookie)|
| POST   | /auth/login           | none | Login (returns cookie)      |
| POST   | /auth/logout          | any  | Clear access token cookie   |
| GET    | /auth/me              | req  | Current user profile        |
| POST   | /auth/forgotpassword  | none | Request a password reset link (email only, always returns ok) |
| POST   | /auth/resetpassword   | none | Reset password with token and new password |

The health endpoint returns `{ services: { redis: 'up' | 'down' } }` indicating Redis connectivity.

## Example Requests
Signup:
```
curl -i -X POST http://localhost:4000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fname":"Ada","lname":"Lovelace","email":"ada@example.com","password":"secret123"}'
```

Login:
```
curl -i -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"secret123"}'
```

Me (after cookie set):
```
curl -i http://localhost:4000/api/v1/auth/me \
  --cookie "accessToken=PASTE_TOKEN_IF_NEEDED"
```

Logout:
```
curl -i -X POST http://localhost:4000/api/v1/auth/logout
```

## Password Reset

- POST `/auth/forgotpassword` — Request a password reset link (email only, always returns ok)
- POST `/auth/resetpassword` — Reset password with token and new password

Environment variables required for email sending and reset token TTL:
```
EMAIL_FROM=no-reply@sliqpay.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
RESET_TOKEN_TTL_SECONDS=900
FRONTEND_URL=http://localhost:3000
```

**Flow:**
1. User requests reset (forgotpassword) — receives email with link.
2. User clicks link, submits new password (resetpassword).
3. Token is single-use and expires after configured TTL.

## Auth Flow (Frontend)
1. User submits signup/login form.
2. Backend sets `accessToken` (httpOnly).
3. Frontend redirects to `/dashboard`.
4. Protected pages verified by Next.js middleware calling `/auth/me` (or decoding token server-side in future).

## Adding Protected Routes
In a route handler:
```
router.get('/secure', authGuard, (req, res) => {
  res.json({ userId: req.user.id, secure: true });
});
```

## Validation Pattern
```
router.post('/thing', validate(schema), controllerFn);
```
`validate` attaches parsed `body` to `req.body` or returns 400 with details.

## Logging
Uses pino. Change level via `LOG_LEVEL=debug`.

## Error Handling
- Unmatched route → 404 JSON
- Validation / auth errors throw objects `{ status, message }`
- 500+ logged via pino

## Current Limitations
- No persistence (memory only)
- No password reset / email verification
- No refresh tokens / session extension
- No rate limiting / audit logging
- No role/permissions
- No tests yet

## Recommended Next Steps
1. Add database (Prisma + PostgreSQL).
2. Introduce refresh token + rotation.
3. Implement rate limiting (express-rate-limit).
4. Add `/auth/logout` (already) + `/auth/refresh`.
5. Add domain modules (transactions, wallet, providers).
6. Add integration tests (vitest + supertest).
7. Centralize error class pattern.

## Security Notes
- Always use HTTPS in production (cookies not secure otherwise).
- Keep `JWT_SECRET` long & random; rotate periodically.
- Add CORS origin whitelist before deployment.

## Redis
- Client initialized on server start (see `src/common/utils/redis.ts`).
- Health check pings Redis and reports status.
- Use helpers `cacheSetJSON(key, value, ttl?)` and `cacheGetJSON(key)` for simple caching.

## Middleware
- Sessions: Redis-backed TTL session store; cookie name `sid` (configurable). See `src/common/session/sessionStore.ts`.
- Rate Limiting: Redis-backed fixed-window counters with standard headers. Global soft limit + stricter per-route limits (e.g., signup/login). See `src/common/middleware/rateLimit.ts`.

## License
Proprietary.