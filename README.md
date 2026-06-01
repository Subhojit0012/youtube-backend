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

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Authenticate a user and receive a JWT token
- `POST /api/videos/upload`: Upload a new video (requires authentication)
- `GET /api/videos`: Get a list of all videos
- `GET /api/videos/:id`: Get details of a specific video
- `DELETE /api/videos/:id`: Delete a specific video (requires authentication)
- `PUT /api/videos/:id`: Update a specific video (requires authentication)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
