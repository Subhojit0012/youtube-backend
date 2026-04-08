# tRPC Backend Documentation

This document explains the full `trpc-backend` codebase as implemented currently.

## 1. Project Overview

`trpc-backend` is a TypeScript Node.js backend that combines:

- `express` as the HTTP server
- `@trpc/server` for RPC endpoints
- `mongoose` for MongoDB models
- `redis` + `express-session` + `connect-redis` for session storage
- a custom structured logger for request and application logs

The project currently exposes user-focused tRPC procedures and foundational models for a video platform domain (users, videos, channels, playlists, comments, likes, subscriptions, history, and sessions).

## 2. Runtime Entry and Request Flow

Main entrypoint: `src/index.ts`

Startup sequence:

1. Load environment variables via `dotenv/config`.
2. Create Express app instance.
3. Configure parsers under `/express`:
   - `express.urlencoded({ extended: true })`
   - `express.json()`
4. Attach request logging middleware globally.
5. Mount session test router at `/express/test`.
6. Mount tRPC middleware at `/trpc` with `appRouter` and `createContext`.
7. Initialize Redis client (`initRedisClient()`).
8. Connect MongoDB (`connectDB()`).
9. Start server on port `2026`.

Important note: the application always listens on port `2026` (hardcoded), not via an env var.

## 3. High-Level Structure

```text
trpc-backend/
  src/
    index.ts
    db/
      connect.db.ts
      models/
        channel.model.ts
        comment.model.ts
        history.model.ts
        like.model.ts
        playlist.model.ts
        session.model.ts
        subscribe.model.ts
        user.model.ts
        video.model.ts
    router/
      _app.router.ts
      auth.route.ts
      history.route.ts
      playlist.route.ts
      user.route.ts
      video.route.ts
    utility/
      asyncHandler.utility.ts
      context.utility.ts
      error.utility.ts
      log.utility.ts
      session.ts
    test/
      test.ts
```

## 4. API Surface

### 4.1 tRPC Root Router

Root router file: `src/router/_app.router.ts`

- `appRouter` is currently composed only from `userRouter`.
- `AppRouter` type is exported for client type inference.

### 4.2 Mounted HTTP Paths

- `POST/GET /trpc/*`: tRPC procedures via `appRouter`
- `GET /express/test/:id`: session lookup endpoint from `utility/session.ts`

### 4.3 User Procedures (`src/router/user.route.ts`)

All procedures are defined with Zod validation.

1. `signup` (mutation)

- Input:
  - `name: string`
  - `email: string`
  - `password: string`
- Behavior:
  - validates fields
  - creates a `User` record
  - creates a `Session` record with `userId`
- Returns:
  - `{ ctx: user }`

2. `login` (mutation)

- Input:
  - `email: string`
  - `password: string`
- Behavior:
  - checks for matching user by email/password
- Returns:
  - `{ message: "Login successful" }`

3. `update` (mutation)

- Input:
  - optional `name`, `email`, `password`
- Behavior:
  - if `name` and `email`, updates user name by email
  - if `password` and `email`, updates password by email
- Returns:
  - `{ ctx: updatedUser }` where `updatedUser` is Mongo update result

4. `getUserById` (query)

- Input:
  - `string` (user id)
- Behavior:
  - finds user by `_id`
- Returns:
  - `{ ctx: user }`

5. `param` (query)

- Input:
  - `string`
- Behavior:
  - echoes the input
- Returns:
  - `{ param: input }`

## 5. Database Layer

### 5.1 Mongo Connection

File: `src/db/connect.db.ts`

- Uses `mongoose.connect(process.env.CONNECTION_STR as string)`.
- Throws connection error to caller.

### 5.2 Mongoose Models

1. `User`

- fields:
  - `name` (required)
  - `email` (required)
  - `password` (required)
  - `isAuthenticated` (default `false`)
  - `profileImg`, `bannerImg`
  - references:
    - `channel` -> `Channel`
    - `subscribs[]` -> `Subscribe`
    - `history[]` -> `History`
    - `playlist[]` -> `Playlist`
    - `videos[]` -> `Video`
- `timestamps: true`

2. `Video`

- nested `meta` object:
  - `likes` count
  - `comments`:
    - `count`
    - `enabled`
    - `userComments[]` -> `Comment`
  - `views`:
    - `count`
    - `viewers[]` -> `User`
- `timestamps: true`

3. `Channel`

- `name`, `description`, `owner` (required)
- arrays:
  - `subscribers[]` -> `User`
  - `videos[]` -> `Video`
  - `playlists[]` -> `Playlist`
- `timestamps: true`

4. `Comment`

- `videoId` -> `Video` (required)
- `userId` -> `User` (required)
- `content` (required)
- `timestamps: true`

5. `Like`

- `userId` -> `User` (required)
- `videoId` -> `Video` (required)
- `timestamps: true`

6. `History`

- `videoId` -> `Video` (required)
- `userId` -> `User` (required)
- `timestamps: true`

7. `Playlist`

- `name` (required)
- `contents[]` -> `Video`
- `timestamps: true`

8. `Session` (Mongo model)

- `userId` -> `User` (required)
- `createdAt` default `Date.now`, TTL `expires: "7d"`
- `updatedAt` default `Date.now`
- instance method `touch()` updates `updatedAt`

9. `Subscribe`

- `subscriber` -> `User` (required)
- `subscribedTo` -> `User` (required)
- `timestamps: true`

## 6. Session and Redis Integration

File: `src/utility/session.ts`

Main pieces:

- `initRedisClient()`
  - creates Redis client once using env vars
  - attaches `error` and `connect` listeners
- `router.use(session(...))`
  - express-session with RedisStore (`connect-redis`)
- `GET /:id`
  - fetches raw Redis value for key `sess:<id>`

Session key helpers:

- `getClientSession(userId)` reads `sess:<userId>`
- `setSessionClient(userId)` writes `{"userId": ...}` if key absent

Important current-state constraints:

- `redisClient.connect()` is never called.
- `setSessionClient` is defined but never used.
- session secret is hardcoded as `"sumit"`.
- Redis session store is created from `redisClient`, which must be initialized first.

## 7. tRPC Context

File: `src/utility/context.utility.ts`

- `createContext` currently returns an empty object (placeholder).
- `router`, `procedure`, `mergeRouters` are exported from initialized `initTRPC`.
- `createInnerContext` exists but is not used in server flow.

Effectively, live procedures do not currently consume session/user context.

## 8. Logging System

File: `src/utility/log.utility.ts`

Features:

- log levels: `debug`, `info`, `warn`, `error`
- pluggable formatter:
  - pretty text formatter (default)
  - JSON formatter when `LOG_FORMAT=json`
- min log level from `LOG_LEVEL` env var
- child logger support with default metadata
- request middleware logs:
  - method, path, status code
  - latency (ms)
  - client IP
  - user-agent

Used in `src/index.ts`:

- app logger child includes `{ service: "trpc-backend" }`
- request logger middleware applied to all routes
- startup / failure / exit events logged

## 9. Other Utility Files

1. `asyncHandler.utility.ts`

- wraps a promise and catches errors
- currently unused in routing flow

2. `error.utility.ts`

- creates a sample `TRPCError` and maps it to HTTP status
- currently not integrated into API error handling

3. `src/test/test.ts`

- helper to build Redis-style key names (`bites:<...>`)

## 10. Environment Variables

Based on current code usage:

- `CONNECTION_STR` (MongoDB connection URI)
- `REDIS_CLIENT_NAME`
- `REDIS_CLIENT_PASSWORD`
- `REDIS_HOST`
- `REDIS_PORT`
- `LOG_LEVEL` (optional: `debug|info|warn|error`)
- `LOG_FORMAT` (optional: set `json` for JSON logs; otherwise pretty logs)

## 11. Scripts and Build Notes

`package.json` scripts:

- `dev`: `node ./dist/index.js --watch`

Current implications:

- Source runs from `dist/`, so TypeScript must be compiled first.
- No `build` script is currently defined in `package.json`.

## 12. Current Gaps / In-Progress Areas

These items are visible directly in code:

- `auth.route.ts` contains middleware scaffold but is not exported/used.
- `history.route.ts`, `playlist.route.ts`, `video.route.ts` are empty.
- `_app.router.ts` only merges `userRouter`.
- login checks plaintext password (no hashing).
- signup computes `existingUser` but does not use it.
- `createContext` does not attach request/session data.
- Redis client lifecycle is incomplete without explicit `.connect()`.

## 13. Minimal Local Run Checklist

1. Install dependencies.
2. Ensure MongoDB and Redis are reachable.
3. Set required env vars listed above.
4. Compile TypeScript to `dist/`.
5. Start server with `npm run dev`.

## 14. Summary

The codebase provides a functional initial user tRPC API with persistent Mongo models and a custom logging stack. Core platform domains are modeled, but many production-critical features (auth enforcement, password security, additional routers, robust session lifecycle, and context-driven authorization) are scaffolded and not fully wired yet.
