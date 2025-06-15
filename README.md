# MERN Stack Real-time Chat Application

A real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and WebSockets for real-time communication.

## Features

- Real-time messaging
- Multiple users in a shared chatroom
- Username handling
- Message history (last 50 messages)
- Online user count
- Responsive design

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/chat-app
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_WS_URL=ws://localhost:5001
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

```
mern-chat-app/
├── backend/               # Backend server code
│   ├── node_modules/
│   ├── .env              # Environment variables
│   ├── package.json
│   └── server.js         # Main server file
├── frontend/              # Frontend React application
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Chat.js
│   │   │   └── UsernameDialog.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
└── README.md
```

## Technologies Used

### Backend
- Node.js
- Express.js
- WebSocket (ws)
- MongoDB with Mongoose
- CORS
- dotenv

### Frontend
- React.js
- Material-UI (MUI)
- WebSocket API
- React Hooks

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built as part of the Kuvaka Tech internship assignment
- Inspired by modern chat applications
