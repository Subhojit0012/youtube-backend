# Model Relationships

This diagram summarizes the conceptual relationships among the Mongoose models in `src/db/models`.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email
        ObjectId channel_id FK
    }

    CHANNEL {
        ObjectId _id PK
        string name
        string description
        ObjectId owner_id FK
    }

    VIDEO {
        ObjectId _id PK
        string title
        string videoFile
        ObjectId owner_id FK
    }

    PLAYLIST {
        ObjectId _id PK
        string name
        ObjectId owner_id FK
    }

    COMMENT {
        ObjectId _id PK
        string content
        ObjectId user_id FK
        ObjectId video_id FK
    }

    HISTORY {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId video_id FK
    }

    SUBSCRIBE {
        ObjectId _id PK
        ObjectId subscriber_id FK
        ObjectId subscribed_to_id FK
        number count
    }

    USER ||--o| CHANNEL : owns
    USER ||--o{ VIDEO : uploads
    CHANNEL ||--o{ VIDEO : contains
    USER ||--o{ PLAYLIST : owns
    CHANNEL ||--o{ PLAYLIST : contains
    PLAYLIST }o--o{ VIDEO : contains
    USER ||--o{ COMMENT : writes
    VIDEO ||--o{ COMMENT : receives
    USER ||--o{ HISTORY : has
    HISTORY }o--o{ VIDEO : records
    USER ||--o{ SUBSCRIBE : subscriber
    USER ||--o{ SUBSCRIBE : subscribed_to
    USER }o--o{ CHANNEL : subscribes_to
```

## Notes

- Mongoose `ref` values identify related documents; they are not database-enforced foreign keys. The `FK` labels above are diagram notation only.
- The diagram consolidates paired references into conceptual relationships. For example, `User.channel` and `Channel.owner` describe channel ownership; `Channel.videos` and `Video.owner` describe the channel's videos and their uploader.
- Some schema fields store references as arrays even where the conceptual relationship is singular per document. In particular, `Comment.videoId` and `Comment.userId` are arrays, while the diagram shows each comment as written by one user and attached to one video. `History.videoId` is also an array, represented as a history record containing multiple videos.
- Subscriptions appear in both `Channel.subscribers` and `Subscribe` (which links one user to another). Both representations are shown because they are distinct references in the current schemas.
