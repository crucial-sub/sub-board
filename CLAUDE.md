# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sub-board is a full-stack bulletin board application built as a monorepo using pnpm workspaces. The stack consists of:

- **Backend (apps/api)**: NestJS + Prisma + PostgreSQL
- **Frontend (apps/web)**: Next.js 15 (App Router) + React + Tailwind CSS + React Query + Zustand
- **Infrastructure (infra)**: Docker Compose for PostgreSQL
- **Shared (packages/shared)**: Common utilities (currently minimal)

## Essential Commands

### Development Workflow

```bash
# Start PostgreSQL database
pnpm dev:infra

# Start API server (http://localhost:3002)
pnpm dev:api

# Start web client (http://localhost:3000)
pnpm dev:web

# Start all services concurrently
pnpm dev
```

### Database Management

```bash
# Navigate to API directory first
cd apps/api

# Generate Prisma Client after schema changes
pnpm db:generate

# Push schema changes to database (development)
pnpm db:push

# Create and run migrations (production)
pnpm db:migrate

# Seed demo data
pnpm db:seed

# Open Prisma Studio to inspect database
pnpm db:studio
```

### Code Quality

```bash
# Run Biome linter
pnpm lint

# Format code with Biome
pnpm format

# Check formatting and linting
pnpm check

# Type-check all packages
pnpm typecheck
```

### Testing

```bash
# Run unit tests (API)
cd apps/api
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# E2E tests
pnpm test:e2e
```

### Building

```bash
# Build all packages
pnpm build

# Build specific workspace
pnpm --filter api build
pnpm --filter web build
```

## Architecture

### Monorepo Structure

This is a pnpm workspace monorepo. The workspace configuration is in `pnpm-workspace.yaml`, defining three workspace groups: `apps/*`, `packages/*`, and `infra`.

### Backend Architecture (NestJS)

The API follows NestJS module-based architecture with strict separation of concerns:

**Core Pattern**: Request → Controller (DTO/Guard/Decorator) → Service → Prisma → Database

**Module Organization**:
- `auth/`: JWT authentication with refresh token rotation (argon2 password hashing)
- `posts/`: Post CRUD with tag management (many-to-many relationship)
- `comments/`: Comment CRUD with ownership validation
- `users/`: User management and statistics
- `notifications/`: Server-Sent Events (SSE) for real-time notifications
- `prisma/`: Database client wrapper as injectable service
- `common/`: Shared decorators and utilities

**Authentication Flow**:
- Access tokens (15min) stored in HttpOnly cookies (`sb_access_token`)
- Refresh tokens (14 days) stored in HttpOnly cookies (`sb_refresh_token`)
- Refresh tokens are hashed and stored in `Session` table with rotation on refresh
- JwtAuthGuard protects routes, JwtStrategy extracts user from cookies → headers
- Custom `@CurrentUser()` decorator provides authenticated user in controllers

**Database Schema** (apps/api/prisma/schema.prisma):
- User → Sessions (1:N), Posts (1:N), Comments (1:N)
- Post → Tags (N:M via implicit join table `_PostToTag`)
- Post → Comments (1:N)
- Tag normalization: lowercase, trimmed, `#` prefix removed, max 10 per post

**Key Implementation Details**:
- Uses `connectOrCreate` for tags to prevent race conditions
- Prisma `$transaction` for atomic list+count queries
- `onDelete: Cascade` relationships for data integrity
- ValidationPipe globally enabled with whitelist/transform

### Frontend Architecture (Next.js)

**Core Technologies**:
- Next.js 15 App Router with server/client component separation
- React Query for server state caching and mutations
- Zustand for authentication state management
- Tailwind CSS with custom pastel gradient theme

**Feature-Based Structure**:
```
src/
├── app/                  # Next.js pages (file-based routing)
│   ├── (auth)/          # Auth pages (login, register)
│   └── (main)/          # Protected pages (home, posts, search)
├── features/            # Domain-driven modules
│   ├── auth/           # Auth API, hooks, components, state
│   └── posts/          # Posts API, hooks, components, types
├── components/layout/   # Global layout components
├── lib/                # Shared utilities (api-client)
└── providers/          # Global providers (React Query, auth store)
```

**Server/Client Component Strategy**:
- Server components handle initial data fetching for SEO and performance
- `getCurrentUserOnServer()` runs SSR authentication with token refresh
- Initial data passed as `initialData` to React Query hooks to prevent loading states
- Client components manage interactivity (forms, mutations, real-time updates)

**State Management**:
- React Query: Server state (posts, comments, tags) with automatic cache invalidation
- Zustand: Client state (current user, authentication status, hydration flag)
- `AuthStoreProvider` initialized with SSR user data to sync client/server state

**API Client Pattern**:
- Centralized `apiClient` handles cookies, CORS, error responses
- 401 errors trigger automatic `clearAuth()` in Zustand store
- ValidationPipe errors from backend displayed directly to users

**Real-time Features**:
- SSE endpoint `/notifications/stream` broadcasts events
- `NotificationToaster` component subscribes and displays toast notifications
- Events: `post.created` (all users), `comment.created` (post author only)

### Authentication Integration

**SSR Authentication Flow**:
1. `app/layout.tsx` calls `getCurrentUserOnServer()`
2. Attempts `GET /auth/profile` with access token from cookies
3. If 401, calls `POST /auth/refresh` to rotate tokens
4. Updates Next.js response cookies with new tokens
5. Returns `currentUser` or `null` to `UiProvider`
6. `AuthStoreProvider` initializes Zustand store with SSR data

**Client-Side Session**:
- `useHydrateAuthSession` checks for token refresh on mount
- `useAuthGuard` redirects to `/login` if not authenticated
- All mutations automatically invalidate related queries

## Environment Variables

Copy `.env.example` to `.env` and configure:

**Database**:
- `DATABASE_URL`: PostgreSQL connection string (used by Prisma)

**JWT Configuration**:
- `JWT_ACCESS_SECRET`: Secret for access token signing
- `JWT_ACCESS_EXPIRES_IN`: Access token lifetime in seconds (900 = 15min)
- `JWT_REFRESH_SECRET`: Secret for refresh token signing
- `JWT_REFRESH_EXPIRES_IN`: Refresh token lifetime in seconds (1209600 = 14 days)

**API Server**:
- `API_PORT`: Backend port (default: 3002)
- `CORS_ORIGIN`: Allowed frontend origin

**Frontend**:
- `NEXT_PUBLIC_API_BASE_URL`: API base URL for client-side requests

## Common Patterns

### Adding a New Feature Module

1. Backend:
   - Create module in `apps/api/src/<feature>/`
   - Define DTOs with `class-validator` decorators
   - Implement Controller → Service → Prisma pattern
   - Add module to `app.module.ts`
   - Protect routes with `@UseGuards(JwtAuthGuard)` if needed

2. Frontend:
   - Create feature folder in `apps/web/src/features/<feature>/`
   - Define API wrappers using `apiClient`
   - Create React Query hooks for queries and mutations
   - Build UI components in `components/`
   - Create page in `app/` directory

### Database Schema Changes

1. Edit `apps/api/prisma/schema.prisma`
2. Run `pnpm db:generate` to update Prisma Client
3. Run `pnpm db:push` (dev) or `pnpm db:migrate` (prod)
4. Update seed script if needed: `apps/api/scripts/seed-demo.ts`

### React Query Cache Invalidation

After mutations, invalidate related queries:
```typescript
onSuccess: () => {
  void queryClient.invalidateQueries({ queryKey: ["posts"] });
  void queryClient.invalidateQueries({ queryKey: ["posts", "tags"] });
}
```

### Tag Implementation Pattern

Tags follow a specific normalization strategy implemented in `apps/api/src/posts/posts.service.ts`:
- Convert to lowercase, trim whitespace, remove `#` prefix
- Use Prisma `connectOrCreate` to handle existing/new tags atomically
- Update operations use `set: []` to clear existing relations before reconnecting

## Code Style

- **Linter**: Biome (configured in `biome.json`)
- **TypeScript**: Strict mode enabled (`tsconfig.base.json`)
- **Module Resolution**: NodeNext with path alias `@shared/*` for shared package
- **Formatting**: Run `pnpm format` before committing

## Project-Specific Notes

- **Korean Language**: All user-facing messages, comments, and documentation are in Korean
- **Cookie Authentication**: Cookies are HttpOnly for security; ensure `credentials: true` in CORS
- **SSR + CSR Hybrid**: Pages use server components for initial data, client components for interactivity
- **Type Safety**: DTO classes on backend, TypeScript interfaces on frontend, Prisma types throughout
- **Pastel Design System**: Custom Tailwind classes defined in `apps/web/src/styles/globals.css` (`surface-card`, `btn-gradient`, etc.)
