# SliqPay Backend

Express + TypeScript API providing auth (signup/login/logout/me) and health check. Currently uses in‑memory storage (no DB yet).

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
        auth.ts          # JWT guard (authGuard / optionalAuth)
        notFound.ts
        errorHandler.ts
      utils/
        logger.ts
        redis.ts         # Redis client & helpers
    modules/
      auth/
        auth.schema.ts
        auth.route.ts
        auth.controller.ts
        auth.service.ts
      users/
        user.model.ts
        user.repository.ts
      health/
        health.controller.ts
        health.route.ts
    routes/
      index.ts
    app.ts
    server.ts
```

## Environment
Create `.env`:
```
PORT=4000
JWT_SECRET=change_this_to_a_long_random_string_at_least_32_chars
NODE_ENV=development
# Redis (optional in dev, required in prod)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=
```
For Redis Cloud, set the values from your provider and ensure network access.

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
| typecheck     | Type-only validation (if added)   |
| lint          | Lint sources (if configured)      |

## API Base
```
http://localhost:4000/api/v1
```

## Endpoints (Current)
| Method | Path          | Auth | Description                 |
|--------|---------------|------|-----------------------------|
| GET    | /health       | none | Liveness check (+ Redis)    |
| POST   | /auth/signup  | none | Create user (returns cookie)|
| POST   | /auth/login   | none | Login (returns cookie)      |
| POST   | /auth/logout  | any  | Clear access token cookie   |
| GET    | /auth/me      | req  | Current user profile        |

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

## License
Proprietary.