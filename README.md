# Aurora Tunes

A modern music streaming web application powered by **Spotify API + Firebase**, featuring search, playlists, user profiles, and a fully interactive audio player.

---

## Features

- **Authentication** - Email/Password & Google Authentication (Firebase)
- **Search** - Search Tracks, Artists, Albums via Spotify API
- **Player** - 30-second song preview playback with shuffle & repeat modes
- **Discovery** - Trending tracks, new releases, genre browsing
- **Playlists** - Create, edit, and manage custom playlists
- **User Profile** - Personalized profile with editable details and photo upload
- **Recommendations** - Artist & Album pages with related content
- **Persistence** - Player state saved in browser storage
- **Controls** - Volume control, playback state management
- **Responsive** - Works on desktop and mobile devices

---

## Project Architecture

```
MusicPlayer/
├── backend/                 # Node.js + Express API server
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic (Spotify integration)
│   ├── src/                # Server configuration
│   ├── app.js              # Express app entry point
│   └── .env.example        # Environment variables template
└── frontend/               # React.js web application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Page components
    │   ├── context/        # Context API (Auth, Player)
    │   ├── hooks/          # Custom React hooks
    │   ├── services/       # API client
    │   ├── config/         # Firebase config
    │   ├── utils/          # Helper functions
    │   └── App.jsx         # Main app component
    └── .env.example        # Environment variables template
```

---

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Firebase** - Authentication & Cloud Storage
- **Axios** - HTTP client for API requests
- **Context API** - State management
- **CSS3** - Styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Spotify Web API** - Music data & streaming
- **Firebase Admin SDK** - Backend authentication
- **dotenv** - Environment variable management

### External Services
- **Firebase** - Authentication, Firestore Database, Cloud Storage
- **Spotify API** - Music data, preview URLs, search functionality

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Spotify Developer Account** - [Register here](https://developer.spotify.com/dashboard)
- **Firebase Project** - [Create at console.firebase.google.com](https://console.firebase.google.com)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/hafsalman/MusicPlayer
cd aMusicPlayer
```

### Step 2: Set Up Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Accept the terms and create the app
4. Copy your **Client ID** and **Client Secret**
5. Add `http://localhost:5000/callback` to Redirect URIs (if needed)

### Step 3: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable **Authentication** (Email/Password & Google Sign-In)
4. Create a **Firestore Database** (start in test mode)
5. Enable **Cloud Storage** for profile photo uploads
6. Go to **Project Settings** → **Your apps** → Copy Firebase config
7. Create a **Service Account key** for backend:
   - Project Settings → Service Accounts → Generate new private key
   - Save the JSON key (keep it secret!)

### Step 4: Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and fill in your values:
# PORT=5000
# FRONTEND_URL=http://localhost:3000
# SPOTIFY_CLIENT_ID=your_spotify_client_id
# SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
# FIREBASE_STORAGE_BUCKET=your-project.appspot.com

nano .env  # or open with your editor
```

**Install dependencies:**

```bash
npm install
```

### Step 5: Frontend Setup

```bash
cd ../frontend

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase config:
# REACT_APP_FIREBASE_API_KEY=your_api_key
# REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
# REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
# REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
# REACT_APP_FIREBASE_APP_ID=your_app_id
# REACT_APP_API_URL=http://localhost:5000/api

nano .env  # or open with your editor
```

**Install dependencies:**

```bash
npm install
```

---

## Running the Application

### Option 1: Run Both Servers (Development Mode)

**Terminal 1 - Start Backend Server:**

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend Development Server:**

```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

### Option 2: Build for Production

**Build Frontend:**

```bash
cd frontend
npm run build
# Creates optimized production build in build/ folder
```

**Start Backend in Production:**

```bash
cd backend
NODE_ENV=production npm start
```

---

## 🔧 Available Scripts

### Frontend Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Backend Scripts

```bash
npm start          # Start Express server
npm run dev        # Start with nodemon (auto-restart on changes)
npm test           # Run backend tests
```

---

## Environment Variables

### Backend (.env)

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### Frontend (.env)

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_URL=http://localhost:5000/api
```

---

## API Endpoints

All endpoints are prefixed with `/api`

### Spotify Endpoints
- `GET /spotify/search?q=query` - Search tracks, artists, albums
- `GET /spotify/artist/:id` - Get artist details
- `GET /spotify/album/:id` - Get album details

### User Endpoints
- `POST /user/register` - Register new user
- `POST /user/login` - Login user
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

### Playlist Endpoints
- `GET /playlist` - Get user playlists
- `POST /playlist` - Create new playlist
- `PUT /playlist/:id` - Update playlist
- `DELETE /playlist/:id` - Delete playlist
- `POST /playlist/:id/tracks` - Add track to playlist

---

## Troubleshooting

### Common Issues

**Port 3000 or 5000 already in use:**
```bash
# On Windows, find process using port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -i :3000
kill -9 <PID>
```

**Firebase config not loading:**
- Verify `.env` files are in the correct directories
- Restart development servers after changing `.env`
- Check Firebase credentials are valid

**Spotify API errors:**
- Ensure Client ID and Client Secret are correct
- Check Spotify API usage limits
- Verify API endpoints are not deprecated

**CORS errors:**
- Check `FRONTEND_URL` in backend `.env` matches your frontend URL
- Ensure both servers are running

---
