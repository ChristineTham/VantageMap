# Phase 10 — Codespaces Continuation Guide

Phase 10 (User Management) has been scaffolded locally. This document contains
the steps required to complete setup, validate, and test in GitHub Codespaces.

## New Dependencies

Better Auth is already in `package.json` (`better-auth@^1.6.11`), but the
following need to be verified/installed:

```bash
# In Codespaces terminal:
npm install
```

No new packages need to be added — Better Auth ships its React integration
(`better-auth/react`), Next.js adapter (`better-auth/next-js`), Drizzle adapter
(`better-auth/adapters/drizzle`), and admin plugin (`better-auth/plugins`) as
sub-path exports from the core package.

## Database Migration

Phase 10 adds the `api_tokens` table and Better Auth's internal tables.

### 1. Generate and apply the API tokens migration

```bash
npm run db:generate
npm run db:migrate
```

### 2. Generate Better Auth schema

Better Auth auto-creates its tables (`user`, `session`, `account`, `verification`)
on first startup. To generate them with Drizzle instead:

```bash
npx @better-auth/cli generate --config src/lib/auth-server.ts --output src/db/schema/auth-tables.ts
```

If the CLI is not available, Better Auth will create its tables automatically
when the first auth request hits `/api/auth/*`. The tables it creates:

| Table          | Purpose                              |
| -------------- | ------------------------------------ |
| `user`         | Core user (email, name, image)       |
| `session`      | Active sessions with expiry          |
| `account`      | OAuth/credential accounts per user   |
| `verification` | Email verification & password reset  |

> **NOTE**: Better Auth's `user` table is separate from VantageMap's `users` table
> (Phase 3.8). You may need to sync user records between the two — see "Known Issues"
> below.

## Environment Variables

Ensure these are set in `.env` (or Codespaces secrets):

```bash
DATABASE_URL="postgresql://..."          # Already set from Phase 3
BETTER_AUTH_SECRET="your-secret-key-at-least-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"   # Or your Codespaces URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Validation Commands

```bash
# 1. Type-check
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Build
npm run build

# 4. Start dev server
npm run dev
```

## Files Created

### Auth Core

| File | Purpose |
| ---- | ------- |
| `src/lib/auth-server.ts` | Better Auth server configuration (plugins, session, DB adapter) |
| `src/lib/auth-client.ts` | Client-side auth utilities (signIn, signUp, signOut, useSession) |
| `src/app/api/auth/[...all]/route.ts` | Better Auth catch-all API route |
| `src/middleware.ts` | Route protection — redirects unauthenticated to /login |

### Auth Pages (Route Group `(auth)`)

| File | Purpose |
| ---- | ------- |
| `src/app/(auth)/layout.tsx` | Minimal centered layout (no sidebar) |
| `src/app/(auth)/login/page.tsx` | Email/password sign-in form |
| `src/app/(auth)/register/page.tsx` | Account creation form |
| `src/app/(auth)/forgot-password/page.tsx` | Password reset request |
| `src/app/(auth)/reset-password/page.tsx` | Password reset with token |

### User Profile (10.2)

| File | Purpose |
| ---- | ------- |
| `src/app/profile/page.tsx` | Profile info, password change, notification prefs |

### Admin UI (10.3, 10.4, 10.5)

| File | Purpose |
| ---- | ------- |
| `src/app/admin/layout.tsx` | Admin sub-navigation bar |
| `src/app/admin/users/page.tsx` | User list, invite, role change, archive |
| `src/app/admin/technical-users/page.tsx` | API token create/revoke UI |
| `src/app/admin/roles/page.tsx` | Permission matrix and role assignments |

### Admin API Routes

| File | Purpose |
| ---- | ------- |
| `src/app/api/admin/users/route.ts` | GET /api/admin/users (list) |
| `src/app/api/admin/users/invite/route.ts` | POST invite |
| `src/app/api/admin/users/[id]/role/route.ts` | PATCH role |
| `src/app/api/admin/users/[id]/status/route.ts` | PATCH status (archive/restore) |
| `src/app/api/admin/tokens/route.ts` | GET list, POST create |
| `src/app/api/admin/tokens/[id]/route.ts` | DELETE revoke |

### Components

| File | Purpose |
| ---- | ------- |
| `src/components/AuthSessionProvider.tsx` | React context providing session to client components |
| `src/components/UserMenu.tsx` | User dropdown in sidebar (profile, admin, sign out) |

### Database Schema

| File | Purpose |
| ---- | ------- |
| `src/db/schema/api-tokens.ts` | API tokens table definition |
| `src/db/schema/index.ts` | Updated barrel export |

### Modified Files

| File | Change |
| ---- | ------ |
| `src/lib/auth.ts` | Integrated Better Auth session + API token validation |
| `src/app/layout.tsx` | Added `AuthSessionProvider` wrapper |
| `src/components/Sidebar.tsx` | Added `UserMenu` component |

## Testing Checklist

### 10.1 — Registration and Login

1. Navigate to `/register` — create a new account
2. Verify redirect to `/` after successful registration
3. Sign out via User Menu
4. Navigate to `/login` — sign in with credentials
5. Verify session cookie is set (`better-auth.session_token`)
6. Visit `/forgot-password` — submit email
7. Check that no error occurs (email won't actually send in dev without SMTP)

### 10.2 — Profile and Settings

1. Click User Menu → "Profile & Settings"
2. Update name → click "Save Changes"
3. Switch to Password tab → change password
4. Switch to Notifications tab → toggle preferences → save

### 10.3 — User Administration

1. Navigate to `/admin/users`
2. Verify the user list loads (shows the current user)
3. Click "Invite User" → enter an email → submit
4. Verify invited user appears in the list with "Invited" status
5. Click ⋮ menu → change role to "Admin" → verify update
6. Click ⋮ menu → "Archive User" → verify status changes

### 10.4 — API Token Management

1. Navigate to `/admin/technical-users`
2. Click "Create Token" → enter name, select expiry
3. Verify token is shown in yellow banner
4. Copy token and dismiss banner
5. Verify token row shows in table with prefix
6. Click delete → confirm → verify removed

### 10.5 — Roles and Permissions

1. Navigate to `/admin/roles`
2. Verify permission matrix renders correctly
3. Verify current user assignments show
4. Change a user's role via dropdown → verify update

### Middleware Protection

1. Clear cookies → navigate to `/` → verify redirect to `/login`
2. Navigate to `/login` → verify no redirect loop
3. Sign in → verify access to protected pages

## Known Issues and Follow-ups

### 1. User Table Synchronization

Better Auth creates its own `user` table. VantageMap has a separate `users` table
from Phase 3.8 with different columns (status lifecycle, etc.). You will need to
either:

- **Option A**: Make Better Auth use the existing `users` table by customizing the
  schema mapping in `auth-server.ts`
- **Option B**: Keep both tables and sync on registration/login using Better Auth's
  `after` hooks

Recommended: **Option A** — add a `schema` configuration to `betterAuth()` that maps
to the existing `users` table.

### 2. SMTP Configuration

Password reset and email verification require an SMTP transport. For development,
you can use:

```bash
# .env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=<ethereal-user>
SMTP_PASS=<ethereal-pass>
```

Or use Better Auth's `sendEmail` hook for console logging in dev.

### 3. Admin Route Guard

Currently, the middleware only checks for session existence (not role). The admin
pages should additionally verify the user has an "Admin" role before rendering
content. The API routes enforce this via `requirePermission(auth, "manage_users")`,
but a client-side redirect would improve UX.

### 4. First User Bootstrap

The first user to register needs to be automatically assigned the "Admin" role and
linked to the default workspace. Consider adding a bootstrap check:

```typescript
// In registration flow: if no users exist, make first user Admin
```

### 5. Workspace Creation

Currently there's no UI for creating workspaces. The seed data includes a default
workspace, but production will need a workspace creation flow (either during
first-user registration or in admin settings).

### 6. Session Refresh

The `AuthSessionProvider` polls for session state. If the session expires while
the user has the app open, they should be redirected to login. Consider adding
a periodic session check or using Better Auth's session refresh mechanism.

## Architecture Notes

```text
Browser → Middleware (cookie check) → Page/API Route
                                        ↓
                              requireAuth() in API routes
                                        ↓
                              Better Auth session validation
                              OR API token hash comparison
                                        ↓
                              resolveUserContext() → AuthContext
                                        ↓
                              requirePermission() → RBAC check
```

The auth flow has three layers:

1. **Middleware** (`src/middleware.ts`): Fast cookie-existence check for page routes.
   Redirects to `/login` if no session cookie. Does NOT validate the session.

2. **API Auth** (`src/lib/auth.ts`): Full session/token validation for API routes.
   Calls Better Auth's `getSession()` or hashes API tokens for comparison.

3. **RBAC** (`src/lib/rbac.ts`): Permission matrix check after authentication.
   Ensures the authenticated user has the right role for the operation.
