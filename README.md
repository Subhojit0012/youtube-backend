# YOUTUBE-BACKEND

This is a backend for a YouTube-like application built using tRPC. It provides APIs for user authentication, video management, and other functionalities required for a video-sharing platform.

## Features

- User authentication (sign up, login, logout)
- Video upload and management

## Technologies Used

- tRPC for building type-safe APIs and Context support
- Mongoose(ORM) for database management
- JWT for authentication
- Express.js for handling HTTP requests

## Getting Started

### Prerequisites

- Node.js installed on your machine
- MongoDB installed and running

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Subhojit0012/youtube-backend.git
   ```

2. Navigate to the project directory:

   ```bash
    cd youtube-backend
    ```

3. Install dependencies:(use pnpm package manager)

    ```bash
    pnpm install
    ```

4. Create an .env file in the root directory and add the following environment variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

### Running the Application

To start the server, run the following command:

```bash
    pnpm start
```

The server will start on the specified port (default is 5000). You can access the APIs at `http://localhost:5000/api`.

## API Endpoints

### Authentication

- `POST /trpc/signup`: Register a new user
- `POST /trpc/login`: Log in a user
- `POST /trpc/logout`: Log out a user
- `GET /trpc/profile`: Get the authenticated user's information
- `POST /trpc/update`: Update user information
- `POST /trpc/delete`: Delete a user account

### Video Management

- `POST /trpc/upload`: Upload a new video
- `GET /trpc/getVideosById`: Get a video by its ID

### Playlist Management

- `POST /trpc/createPlaylist`: Create a new playlist
- `POST /trpc/addVideoToPlaylist`: Add a video to a playlist

### History Management

- `POST /trpc/addToHistory`: Add a video to the user's watch history
- `GET /trpc/getHistory`: Get the user's watch history

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
