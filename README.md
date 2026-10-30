# YouTube Backend

A TypeScript backend for a YouTube-like application. It uses Express to host a
tRPC API, Mongoose to persist data in MongoDB, and JWTs for authentication.
The project is an early-stage implementation; see [Current limitations](#current-limitations)
before relying on unfinished endpoints.

## Features

- User signup and login with JWTs returned in the `Authorization` response header
- Protected user, video, and watch-history procedures
- Playlist procedures and Mongoose models for users, videos, channels, comments,
  playlists, subscriptions, and history
- Structured request and application logging

## Technology

- Node.js and TypeScript
- Express 5 and tRPC 11
- MongoDB with Mongoose
- JSON Web Tokens
- pnpm

## Getting started

### Prerequisites

- Node.js (the Docker image uses Node.js 22)
- pnpm
- A reachable MongoDB instance

### Install

```bash
git clone https://github.com/Subhojit0012/youtube-backend.git
cd youtube-backend
pnpm install
```

Create a `.env` file in the project root:

```env
CONNECTION_STR=mongodb://localhost:27017/youtube-backend
JWT_SECRET=replace-with-a-long-random-secret
```

`CONNECTION_STR` is used by the MongoDB connector. `JWT_SECRET` is used to sign
and verify authentication tokens. Optional logging settings are `LOG_LEVEL`
(`debug`, `info`, `warn`, or `error`) and `LOG_FORMAT` (`json` for JSON output;
otherwise logs are formatted as readable text).

### Run locally

Compile the TypeScript source and start the compiled server:

```bash
pnpm exec tsc
pnpm dev
```

Alternatively, run the TypeScript entry point directly:

```bash
pnpm exec tsx ./src/index.ts
```

The server connects to MongoDB and listens on port `2026`. Its tRPC endpoint is
`http://localhost:2026/trpc`.

> **Docker Compose note:** `docker-compose.yml` currently supplies `MONGODB_URI`,
> while the application reads `CONNECTION_STR`. Set `CONNECTION_STR` in the
> Compose app environment before starting the stack, or the database connection
> will not use the configured Compose MongoDB service.

## API procedures

All procedures are exposed through tRPC at `/trpc`. Mutations and queries use
the transport and HTTP method conventions of the tRPC client.

| Procedure            | Type     | Input                                          | Authentication                                                                             |
| -------------------- | -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `signup`             | Mutation | `{ name, email, password }`                    | No                                                                                         |
| `login`              | Mutation | `{ email, password }`                          | No                                                                                         |
| `deleteUser`         | Mutation | User ID string                                 | JWT required                                                                               |
| `update`             | Mutation | `{ name, email, password }`                    | JWT required                                                                               |
| `profile`            | Query    | String input (currently ignored)               | JWT required                                                                               |
| `upload`             | Mutation | `{ title, description, videoFile, thumbnail }` | JWT required                                                                               |
| `getVideoById`       | Query    | Video ID string                                | No                                                                                         |
| `createPlaylist`     | Mutation | `{ name }`                                     | Intended to require a JWT; currently fails because its procedure does not decode the token |
| `addVideoToPlayList` | Mutation | `{ playListId, videoId }`                      | Intended to require a JWT; currently fails because its procedure does not decode the token |
| `addToHistory`       | Mutation | `{ videoId }`                                  | JWT required                                                                               |
| `getHistory`         | Query    | No input                                       | JWT required                                                                               |

Send authenticated requests with an `Authorization: Bearer <token>` header.
Signup and login put the signed token in the response `Authorization` header.
The exact output shape and current behavior are documented in
[document.md](./document.md).

## Project layout

```text
src/
  index.ts                 Express and tRPC server bootstrap
  db/
    connect.db.ts          MongoDB connection
    models/                Mongoose schemas
  router/                  tRPC procedure definitions and root router
  service/                 User, video, playlist, and history operations
  utility/                 Context, JWT, logging, errors, and rate limiter
test/                      Service tests
docs/                      Model, sequence, and video-storage documentation
```

## Scripts and tests

`pnpm dev` runs `dist/index.js` with Node's watch mode. Compile first with
`pnpm exec tsc`; the package does not currently define a build or test script.
Tests are in `test/`.

## Current limitations

- The playlist procedures use the regular tRPC procedure but expect a decoded
  JWT payload, so they reject requests in the current context setup.
- Video upload starts the database operation without awaiting it, then returns
  a success response; a failed write may therefore happen after the response.
- The `profile` procedure requires an input string but looks up the user from
  the JWT instead of using that input.
- The `deleteUser` procedure checks that a token payload exists but does not
  verify that the requested user ID belongs to that token.
- Redis rate limiting is not wired into the server bootstrap. The rate-limiter
  utility expects `REDIS_URL` if it is imported and used.
- Passwords are stored and compared as plain text in the current user service.
- The configured Compose MongoDB variable does not match the variable read by
  the application; see the Docker Compose note above.

## Additional documentation

- [Full implementation notes](./document.md)
- [Model relationships](./docs/model-relations.md)
- [Sequence diagrams](./docs/sequence-diagram.md)
- [Video storage notes](./docs/video-storage.md)
