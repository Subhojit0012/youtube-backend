# Request Sequence Diagram

This document explains how requests move through the current `trpc-backend` codebase and gives sequence diagrams for the most important runtime paths.

## Scope

The repository currently exposes a single Express-mounted tRPC entrypoint:

- `/trpc`

Because the root router is assembled with `mergeRouters(...)`, procedures are currently exposed as top-level tRPC procedures such as:

- `signup`
- `login`
- `createPlaylist`
- `addToHistory`

Requests then flow through:

1. Express request logging middleware
2. tRPC Express middleware
3. `createContext` in `src/utility/context.utility.ts`
4. A router procedure in `src/router/*`
5. A service or Mongoose model call
6. MongoDB through Mongoose

## High-Level Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Express as Express app
    participant Logger as Request logger
    participant TRPC as tRPC Express middleware
    participant Context as createContext()
    participant Router as appRouter procedure
    participant Service as Service/Model layer
    participant Mongo as MongoDB via Mongoose

    Client->>Express: HTTP request to /trpc/<procedure>
    Express->>Logger: apply request logging middleware
    Logger-->>Express: continue request
    Express->>TRPC: forward request
    TRPC->>Context: build request context
    Context-->>TRPC: { req, res, token? }
    TRPC->>Router: execute matched procedure
    Router->>Service: call service or model logic
    Service->>Mongo: query/create/update document
    Mongo-->>Service: document/result
    Service-->>Router: return data or throw error
    Router-->>TRPC: procedure response
    TRPC-->>Express: serialized tRPC response
    Express-->>Client: HTTP response
```

## Authentication-Aware Flow

The repository uses `authProcedure` for protected procedures such as:

- `deleteUser`
- `update`
- `getUserById`
- `createPlaylist`
- `addVideoToPlayList`
- `addToHistory`

`authProcedure` decodes the bearer token from the `Authorization` header and extends the request context with `payload`.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Express as Express app
    participant TRPC as tRPC middleware
    participant Context as createContext()
    participant Auth as authProcedure middleware
    participant Router as Protected procedure
    participant Model as Service/Model
    participant Mongo as MongoDB

    Client->>Express: Request with Authorization: Bearer <jwt>
    Express->>TRPC: /trpc protected procedure
    TRPC->>Context: extract bearer token
    Context-->>TRPC: { req, res, token }
    TRPC->>Auth: run authProcedure
    Auth->>Auth: decodeToken(token)
    alt token valid
        Auth-->>Router: ctx + payload
        Router->>Model: perform business operation
        Model->>Mongo: read/write data
        Mongo-->>Model: result
        Model-->>Router: success
        Router-->>Client: success response
    else token invalid or missing
        Auth-->>Client: TRPCError(UNAUTHORIZED)
    end
```

## Concrete Example: `login`

`login` is the entrypoint that issues the JWT used later by protected procedures.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Express as Express app
    participant TRPC as tRPC middleware
    participant Context as createContext()
    participant UserRouter as userRouter.login
    participant UserService as login()
    participant UserModel as User model
    participant Mongo as MongoDB

    Client->>Express: login mutation(email, password)
    Express->>TRPC: forward /trpc/login
    TRPC->>Context: create context
    Context-->>TRPC: { req, res }
    TRPC->>UserRouter: execute login mutation
    UserRouter->>UserService: login(input)
    UserService->>UserModel: findOne({ email, password })
    UserModel->>Mongo: query user collection
    Mongo-->>UserModel: matched user or null
    UserModel-->>UserService: user document
    UserService-->>UserRouter: user _id
    UserRouter->>UserRouter: sign JWT with JWT_SECRET
    UserRouter->>Client: set Authorization response header
    UserRouter-->>Client: { message: "Login successful" }
```

## Concrete Example: `createPlaylist`

This is a good example of the protected request lifecycle because it uses `authProcedure`, reads the decoded token, and persists data through a model static.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Express as Express app
    participant TRPC as tRPC middleware
    participant Context as createContext()
    participant Auth as authProcedure
    participant PlaylistRouter as playlist.createPlaylist
    participant PlaylistModel as Playlist model
    participant Mongo as MongoDB

    Client->>Express: createPlaylist(name) + Bearer token
    Express->>TRPC: forward /trpc/createPlaylist
    TRPC->>Context: extract token from Authorization header
    Context-->>TRPC: { req, res, token }
    TRPC->>Auth: validate token
    Auth->>Auth: decodeToken(token)
    Auth-->>PlaylistRouter: ctx.payload.id available
    PlaylistRouter->>PlaylistRouter: derive userId from payload
    PlaylistRouter->>PlaylistModel: Playlist.createPlaylist(name, userId)
    PlaylistModel->>Mongo: insert playlist document
    Mongo-->>PlaylistModel: created playlist
    PlaylistModel-->>PlaylistRouter: success
    PlaylistRouter-->>Client: { message: "Playlist created successfully" }
```

## Azure Video Upload And Transcoding Flow

This sequence reflects the storage architecture described in [video-storage.md](/C:/Users/subho/OneDrive/Desktop/project-models/trpc-backend/docs/video-storage.md): raw uploads go to Azure Blob Storage, a queue triggers asynchronous transcoding, FFmpeg generates multiple renditions, and Azure CDN serves the final assets.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as Backend API
    participant Blob as Azure Blob Storage
    participant Queue as Azure Storage Queue
    participant Worker as Azure Function / Container Instance
    participant FFmpeg as FFmpeg
    participant CDN as Azure CDN

    User->>API: Upload video file + metadata
    API->>Blob: Store raw video blob
    Blob-->>API: Raw blob path / URL
    API->>Queue: Enqueue transcoding job
    API-->>User: Upload accepted + video reference

    Queue-->>Worker: Deliver transcoding job
    Worker->>Blob: Download raw video
    Blob-->>Worker: Raw video file
    Worker->>FFmpeg: Generate 360p, 480p, 720p, 1080p outputs

    loop For each resolution
        FFmpeg-->>Worker: Transcoded file
        Worker->>Blob: Upload transcoded blob
        Blob-->>Worker: Blob stored
    end

    User->>CDN: Request video playback
    CDN->>Blob: Fetch rendition on cache miss
    Blob-->>CDN: Requested video file
    CDN-->>User: Stream optimized video
```

## Router-to-Service Map

The current repository uses these main execution paths:

| Procedure | Protection | Main downstream call |
| --- | --- | --- |
| `signup` | public | `createUser()` |
| `login` | public | `login()` |
| `deleteUser` | authenticated | `deleteUser()` |
| `update` | authenticated | `updateUser()` |
| `getUserById` | authenticated | `User.findById()` |
| `uploadVideo` | public in current code | `createVideoModel()` |
| `getVideoById` | public | `getVideoById()` |
| `createPlaylist` | authenticated | `Playlist.createPlaylist()` |
| `addVideoToPlayList` | authenticated | `Playlist.findOne()` then `playlist.addToPlaylist()` |
| `addToHistory` | authenticated | `historyService()` |

## Notes About The Current Implementation

- `createContext` currently extracts the bearer token but does not decode it directly.
- Token decoding happens inside `authProcedure`.
- Protected routes depend on the client sending `Authorization: Bearer <jwt>`.
- `login` and `signup` currently place the token in the response `Authorization` header.
- `uploadVideo` is not protected right now because it uses `procedure` instead of `authProcedure`.

These details are reflected in the diagrams above so the documentation matches the repository as it exists today.
