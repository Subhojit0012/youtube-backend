# tRPC Backend Documentation

This document describes the current implementation in the repository. It
distinguishes wired behavior from models, utilities, and procedures that are
present but incomplete.

## 1. Overview

The project is a TypeScript Node.js service built with:

- Express for the HTTP server
- tRPC for the API and procedure types
- Mongoose for MongoDB persistence
- JSON Web Tokens for request authentication
- A custom logger for request and application logs

The MongoDB models cover users, videos, channels, comments, playlists,
subscriptions, and watch history. The running root router merges user, playlist,
video, and history routers.

## 2. Startup and request flow

The entry point is `src/index.ts`.

1. `dotenv/config` loads environment variables.
2. Express is created and the request-logging middleware is installed.
3. The tRPC middleware is mounted at `/trpc` with `appRouter` and
   `createContext`.
4. `connectDB()` connects to MongoDB using `CONNECTION_STR`.
5. After a successful connection, Express listens on port `2026`.

The Redis initialization call is commented out in the entry point. There is no
session middleware or separate `/auth` or `/express` route mounted by the
current server.

## 3. Source layout

```text
src/
  index.ts
  db/
    connect.db.ts
    models/
      channel.model.ts
      comment.model.ts
      history.model.ts
      playlist.model.ts
      subscribe.model.ts
      user.model.ts
      video.model.ts
  router/
    _app.router.ts
    history.route.ts
    playlist.route.ts
    user.route.ts
    video.route.ts
  service/
    history.service.ts
    playlist.service.ts
    user.service.ts
    video.service.ts
  utility/
    asyncHandler.utility.ts
    context.utility.ts
    error.utility.ts
    log.utility.ts
    rateLimiter.utility.ts
    token.utility.ts
test/
  history.service.test.ts
  playlist.service.test.ts
  user.service.test.ts
  video.service.test.ts
```

## 4. tRPC API

`src/router/_app.router.ts` merges all four routers. The procedure names below
are therefore available below `/trpc`.

### User procedures

| Procedure    | Type     | Input                                               | Current behavior                                                                                                                                                              |
| ------------ | -------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signup`     | Mutation | `{ name: string, email: string, password: string }` | Creates a user and sets a signed JWT in the response `Authorization` header. It returns no procedure result.                                                                  |
| `login`      | Mutation | `{ email: string, password: string }`               | Finds a user by matching email and plain-text password, sets a JWT response header, and returns `{ message: "Login successful" }`.                                            |
| `deleteUser` | Mutation | User ID string                                      | Requires `authProcedure` and deletes the supplied ID. It does not compare the supplied ID with the authenticated user's ID and returns no procedure result.                   |
| `update`     | Mutation | `{ name: string, email: string, password: string }` | Requires `authProcedure` and calls the update service. The route schema requires all three fields, while the service updates by email; the route returns no procedure result. |
| `profile`    | Query    | String                                              | Requires `authProcedure`; the input is checked for non-empty content but the lookup uses the ID from the token. Returns `{ ctx: user }`.                                      |

The signup and login token is signed with `JWT_SECRET` and expires after one day.
The current user service stores and checks passwords without hashing.

### Video procedures

| Procedure      | Type     | Input                                          | Current behavior                                                                                                                                                                                                                             |
| -------------- | -------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `upload`       | Mutation | `{ title, description, videoFile, thumbnail }` | Requires `authProcedure`, starts creating a video document, and returns `{ message: "Video uploaded successfully" }`. The service call is not awaited, and the route reads `_id` from a token payload that is created with an `id` property. |
| `getVideoById` | Query    | Video ID string                                | Public query that fetches a video by MongoDB ID. The result can be `null` when no video matches.                                                                                                                                             |

The `videoFile` and `thumbnail` values are strings. The current service stores
their values in MongoDB; Azure Blob Storage and video transcoding are not
implemented in the server.

### Playlist procedures

| Procedure            | Type     | Input                                     | Current behavior                                                                                        |
| -------------------- | -------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `createPlaylist`     | Mutation | `{ name: string }`                        | Attempts to read the owner ID from `ctx.payload`, then creates a playlist.                              |
| `addVideoToPlayList` | Mutation | `{ playListId: string, videoId: string }` | Attempts to read the owner ID from `ctx.payload`, checks the playlist owner, then appends the video ID. |

Both routes use `procedure`, not `authProcedure`. `createContext` does not
decode the token into `ctx.payload`, so these procedures currently throw
`UNAUTHORIZED` for normal requests rather than operating as authenticated
playlist routes.

### History procedures

| Procedure      | Type     | Input                 | Current behavior                                                                                                                           |
| -------------- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `addToHistory` | Mutation | `{ videoId: string }` | Requires `authProcedure`, adds the video to the user's history, and returns a message. Repeated videos are moved to the front.             |
| `getHistory`   | Query    | None                  | Requires `authProcedure` and returns `{ history }`, with populated video fields when a history record exists and an empty array otherwise. |

## 5. Authentication and tRPC context

`src/utility/context.utility.ts` creates a context containing the Express
request and response. If the request has an `Authorization` header, it extracts
the second space-delimited value as `token`.

`authProcedure` passes that token to `decodeToken` and adds the verified JWT
payload as `ctx.payload`. Requests using this procedure must send:

```http
Authorization: Bearer <token>
```

The token utilities use `JWT_SECRET`. There is no session-backed authentication
in the current request flow. `decodeToken` calls `jwt.verify`; missing or
invalid tokens do not become an unauthenticated `null` result.

## 6. MongoDB models

All schemas use Mongoose timestamps unless otherwise noted. References are
MongoDB ObjectIds configured with Mongoose `ref`; they are not database
foreign-key constraints.

### User

- Required: `name`, `email`, `password`
- `isAuthenticated` defaults to `false`
- Optional: `profileImg`, `bannerImg`
- Optional reference: `channel` to `Channel`
- `subscribs` is an array of `Channel` references (field spelling as implemented)
- `history` is an optional `History` reference
- `playlist` is an array of `Playlist` references

### Video

- Required: `title`, `videoFile`, `thumbnail`
- Optional: `description`
- `meta.likes` defaults to `0`
- `meta.comments` contains a count, an enabled flag, and `Comment` references
- `meta.views` contains a count and `User` references
- Optional `owner` reference to `User`

### Channel

- Required: `name`, `description`, and `owner` (`User` reference)
- `subscribers` contains `Subscribe` references
- `videos` contains `Video` references
- `playlists` contains `Playlist` references

### Comment

- Required `videoId` array of `Video` references
- Required `userId` array of `User` references
- Required `content`

The schema uses arrays for the author and video references, not single
references.

### History

- Required `userId` reference to `User`
- `videoId` array of `Video` references

### Playlist

- Required `name` and `owner` (`User` reference)
- `contents` is an array of `Video` references
- Schema methods/statics for adding a video and creating playlists are present
  in addition to the route-level operations.

### Subscribe

- Required `subscriber` reference to `User`
- Required `subscribedTo` reference to `Channel`
- `count` defaults to `0`

There are no `Like` or `Session` models in the current `src/db/models`
directory.

## 7. Services and utilities

### Services

- `user.service.ts` creates, finds, updates, and deletes users. It compares
  plain-text passwords.
- `video.service.ts` creates and fetches video documents. It also contains
  unfinished or unused video operations.
- `history.service.ts` stores one history document per user and moves a
  repeated video to the front of its `videoId` array.
- `playlist.service.ts` contains a separate playlist workflow and is not the
  implementation used by the current playlist router.

### Logging

`log.utility.ts` provides `debug`, `info`, `warn`, and `error` levels, child
loggers, and readable or JSON formatting. The request middleware logs the HTTP
method, path, status, latency, client IP, and user agent. `LOG_LEVEL` defaults
to `info`; `LOG_FORMAT=json` selects JSON output.

### Rate limiting

`rateLimiter.utility.ts` contains a Redis-backed token-bucket implementation
and Express middleware. It expects `REDIS_URL`, but it is not imported by the
server entry point or applied to the current routes. Redis is therefore not
required by the current server bootstrap.

`asyncHandler.utility.ts` and `error.utility.ts` are also not part of the
current route flow.

## 8. Configuration and commands

| Variable         | Required by                             | Purpose                                                   |
| ---------------- | --------------------------------------- | --------------------------------------------------------- |
| `CONNECTION_STR` | Server startup                          | MongoDB connection URI                                    |
| `JWT_SECRET`     | Signup, login, and protected procedures | JWT signing and verification                              |
| `LOG_LEVEL`      | Optional                                | Minimum logger level: `debug`, `info`, `warn`, or `error` |
| `LOG_FORMAT`     | Optional                                | Set to `json` to emit JSON logs                           |
| `REDIS_URL`      | Rate-limiter utility only               | Redis connection URL if that utility is imported and used |

The package scripts currently define only:

- `pnpm dev`: runs the compiled `dist/index.js` with Node watch mode; compile
  first using `pnpm exec tsc`.
- No `build` or `test` script is defined.

The Docker image runs `pnpm exec tsx ./src/index.ts`. The Compose app currently
sets `MONGODB_URI`, but the application reads `CONNECTION_STR`; align this
environment variable before expecting the Compose application to connect to
its MongoDB service.

## 9. Current implementation gaps

- Passwords are stored and compared as plain text.
- `upload` does not await video creation and reads `payload._id`, although the
  issued JWT contains `id`.
- Playlist procedures do not use `authProcedure`, so the context does not
  provide the payload they require.
- `deleteUser` does not restrict deletion to the authenticated user's ID.
- The profile input is required but ignored for the lookup.
- Redis rate limiting exists as a utility but is not connected to the server.
- Video storage and transcoding are described separately in
  `docs/video-storage.md`; the current video service only stores string fields
  in MongoDB.
- The Compose MongoDB environment variable currently differs from the name
  consumed by the application.
