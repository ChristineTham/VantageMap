# Better Auth — Best Practices Review

Review of VantageMap's Better Auth implementation against the [Better Auth best practices guide](https://better-auth.com/docs).

**Date:** 2025-06-01  
**Files reviewed:**
- `src/lib/auth-server.ts` — Server configuration
- `src/lib/auth-client.ts` — Client configuration
- `src/lib/auth.ts` — Custom authentication middleware
- `src/app/api/auth/[...all]/route.ts` — Catch-all route handler
- `src/middleware.ts` — Next.js route protection
- `src/components/AuthSessionProvider.tsx` — Session context
- `src/app/(auth)/` — Login, register, forgot/reset password pages
- `src/env.ts` — Environment validation
- `src/db/schema/users.ts` — User/workspace schema
- `src/db/schema/api-tokens.ts` — API tokens schema

---

## Summary

| Area | Verdict | Priority |
|------|---------|----------|
| Environment variables | ✅ Correct | — |
| Server configuration | ⚠️ 3 issues | Medium |
| Client configuration | ⚠️ 1 issue | Low |
| Route handler | ✅ Correct | — |
| Middleware (Next.js) | ⚠️ 2 issues | Medium |
| Session management | ✅ Correct | — |
| Password flows | ⚠️ 2 issues | Medium |
| Email verification | ❌ Missing | High |
| Rate limiting | ❌ Missing | High |
| Type safety | ⚠️ 1 issue | Low |
| CSRF / trusted origins | ✅ Correct | — |
| Plugin imports | ✅ Correct | — |
| Database adapter | ✅ Correct | — |
| Custom middleware (auth.ts) | ⚠️ 1 issue | Low |

---

## Findings

### ❌ HIGH — Email Verification Not Configured

**File:** `src/lib/auth-server.ts`

Better Auth supports email verification out of the box, but the config has no `emailVerification` block. This means:
- Users can register with any email address without proof of ownership
- Password reset emails cannot be sent (no `sendResetPassword` handler defined)
- The forgot-password page calls `/api/auth/request-password-reset` but Better Auth has no email transport configured

**Recommendation:**
```typescript
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    // Use a transactional email service (Resend, Postmark, etc.)
    await sendEmail({ to: user.email, subject: "Verify your email", url });
  },
  sendOnSignUp: true,
},
emailAndPassword: {
  // ...existing config...
  sendResetPassword: async ({ user, url }) => {
    await sendEmail({ to: user.email, subject: "Reset your password", url });
  },
},
```

Until an email provider is wired, password reset is non-functional and email verification is bypassed.

---

### ❌ HIGH — No Rate Limiting

**File:** `src/lib/auth-server.ts`

No `rateLimit` configuration exists. Auth endpoints (login, registration, password reset) are vulnerable to brute-force attacks.

**Recommendation:**
```typescript
rateLimit: {
  enabled: true,
  window: 60,       // 60-second window
  max: 10,          // 10 requests per window per IP
  storage: "memory" // or "database" / "secondary-storage"
},
```

---

### ⚠️ MEDIUM — Server Config Uses `process.env` Directly

**File:** `src/lib/auth-server.ts` (lines 27-28)

```typescript
baseURL: process.env.BETTER_AUTH_URL,
secret: process.env.BETTER_AUTH_SECRET,
```

Per the skill guide: "Only define `baseURL`/`secret` in config if env vars are NOT set." Better Auth auto-reads `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` from environment. Defining them explicitly is redundant and creates a divergence risk if env var names change.

**Recommendation:** Remove both lines. Better Auth will pick up the env vars automatically.

---

### ⚠️ MEDIUM — Middleware Only Checks Cookie Existence, Not Validity

**File:** `src/middleware.ts` (line 40)

```typescript
const sessionToken = request.cookies.get("better-auth.session_token");
if (!sessionToken?.value) { ... redirect ... }
```

The middleware only checks whether the cookie *exists*, not whether the session is valid or expired. An expired or revoked session cookie will still pass the middleware. The actual validation happens in API routes via `auth.ts`, but pages/components that do not make API calls will render authenticated content even with a stale cookie.

**Recommendation:** Use Better Auth's `getSession` server-side in the middleware, or accept this as intentional (session validated on API call, stale page content is acceptable UX-wise).

---

### ⚠️ MEDIUM — Middleware Does Not Protect `/api/*` Routes (Except via `auth.ts`)

**File:** `src/middleware.ts`

The `config.matcher` catches all paths, but only checks for cookie presence. API routes like `/api/capabilities` rely on `auth.ts` → `authenticate()` separately. This is fine architecturally, but means:

1. Unauthenticated API requests get through middleware (no cookie redirect for APIs is correct)
2. However, there's no explicit `/api` exclusion in `PUBLIC_PATHS` (only `/api/auth` is listed)

This works because API routes return 401 JSON (not redirect) via `auth.ts`. No action required, but documenting intent would improve clarity.

---

### ⚠️ MEDIUM — Password Reset Has No `sendResetPassword` Handler

**File:** `src/app/(auth)/forgot-password/page.tsx`

The forgot-password page posts to `/api/auth/request-password-reset`, but the server config (`auth-server.ts`) has no `sendResetPassword` callback defined. Better Auth will not send any email — the endpoint will succeed silently but the user receives nothing.

**Recommendation:** This is the same root issue as the "Email Verification" finding above. An email transport must be configured.

---

### ⚠️ MEDIUM — `forgot-password` Uses Raw `fetch` Instead of Auth Client

**File:** `src/app/(auth)/forgot-password/page.tsx` (line 20)

```typescript
const res = await fetch("/api/auth/request-password-reset", { ... });
```

Other auth pages use the typed `authClient` methods (`signIn.email()`, `signUp.email()`, `authClient.resetPassword()`). The forgot-password page uses a raw `fetch` call which misses:
- Automatic CSRF token handling
- Type safety on request/response
- Error normalization

**Recommendation:** Use `authClient.forgetPassword({ email, redirectTo })` instead.

---

### ⚠️ LOW — Client `baseURL` Duplicates Logic

**File:** `src/lib/auth-client.ts` (line 15)

```typescript
baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
```

The `NEXT_PUBLIC_APP_URL` env var is optional (per `env.ts`). If not set, this falls back to `localhost:3000`. This is fragile for deployments — if someone forgets to set the env var, the client will talk to localhost.

**Recommendation:** Make `NEXT_PUBLIC_APP_URL` required in production, or conditionally error in non-development.

---

### ⚠️ LOW — Type Inference Not Exported

**File:** `src/lib/auth-server.ts`

The file exports `type Auth = typeof auth`, but no `Session` or `User` types are derived using `auth.$Infer.Session`. Components like `AuthSessionProvider` manually define the user shape instead of inferring from the auth instance.

**Recommendation:**
```typescript
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

Then use these in `AuthSessionProvider` instead of manually declaring the interface.

---

### ⚠️ LOW — Dev-Mode Bypass Has No Guard Against Production Leakage

**File:** `src/lib/auth.ts` (line 91)

```typescript
if (process.env.NODE_ENV === "development") {
  const devUserId = request.headers.get("x-dev-user-id");
  if (devUserId) { return resolveUserContext(devUserId); }
}
```

This is gated by `NODE_ENV`, which is correctly set in production. However, best practice is to additionally log when the dev bypass is used, or remove it entirely before production deployment to eliminate the risk surface.

---

## What's Done Well

1. **Plugin imports** — `admin` imported from `better-auth/plugins` (dedicated path, tree-shakeable) ✅
2. **Drizzle adapter** — Correctly uses `drizzleAdapter(db, { provider: "pg" })` ✅
3. **Session config** — Reasonable expiry (7 days), refresh interval (24h), cookie cache (5 min) ✅
4. **Trusted origins** — Dynamically set from `NEXT_PUBLIC_APP_URL` with localhost fallback ✅
5. **Environment validation** — `@t3-oss/env-nextjs` validates `BETTER_AUTH_SECRET` min length (32 chars) ✅
6. **Route handler** — Uses `toNextJsHandler(auth)` correctly ✅
7. **Auth client** — Proper `adminClient()` plugin on client side ✅
8. **Password UX** — Visibility toggle, length validation, confirm field, error feedback ✅
9. **Bearer + session dual auth** — Custom middleware correctly tries both paths ✅
10. **API token hashing** — SHA-256 hash comparison, expiry check, last-used tracking ✅

---

## Remediation Priority

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 1 | Add rate limiting | Small | Prevents brute-force |
| 2 | Configure email transport + verification | Medium | Enables password reset, proves email ownership |
| 3 | Replace raw `fetch` in forgot-password with `authClient.forgetPassword()` | Small | Type safety + CSRF |
| 4 | Remove redundant `baseURL`/`secret` from server config | Trivial | Cleaner config |
| 5 | Export inferred types from auth instance | Small | Better type safety |
| 6 | Make `NEXT_PUBLIC_APP_URL` required in production | Small | Prevents misconfiguration |
