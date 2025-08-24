# Smite Draft Tool

A real-time multiplayer draft tool for Smite Ranked Conquest that simulates the game's pick/ban phase with full multiplayer support.

## ✨ Features

### Single-Player Mode (Default)
- **Offline Drafting**: Practice draft scenarios locally
- **Complete Draft Flow**: 6 bans + 10 picks following Smite's competitive format
- **God Filtering**: Filter by role (Guardian, Hunter, Mage, Assassin, Warrior)
- **Undo/Reset**: Backspace to undo, reset button to start over

### Multiplayer Mode
- **Real-time Sync**: All players see draft updates instantly
- **Shareable Rooms**: Create rooms with 6-character codes
- **Live Chat**: Communicate with other drafters
- **Auto-join Links**: Share URLs that auto-join rooms
- **Collaborative Drafting**: Everyone in the room can pick/ban

### Technical Features
- **React + Vite + Tailwind**: Modern development stack
- **Socket.IO**: Real-time multiplayer communication
- **Mobile Responsive**: Works on all screen sizes
- **God Database**: Complete Smite god roster with local images

## 🚀 Quick Start

### Frontend Only (Single-Player)
```bash
npm install
npm run dev
```

### Full Multiplayer Setup
```bash
# Start backend server
cd server
npm install
npm run dev

# Start frontend (in another terminal)
npm install  
npm run dev
```

## 🎮 How to Use

### Single-Player Mode
1. Open the app → starts in single-player mode
2. Click gods to ban/pick following the turn indicator
3. Use role filters to find specific gods
4. Press Backspace to undo, Reset to start over

### Creating Multiplayer Rooms
1. Click **"🔗 Share Draft"** button
2. Room is created with a 6-character code
3. Click **"📋 Copy Link"** to share with others
4. Others can join via link or room code

### Joining Rooms
- **Via Link**: Click shared link to auto-join
- **Via Code**: Click **"🚀 Join Room"** and enter 6-character code
- **From URL**: Add `?room=ROOMID` to URL

## 🏗️ Architecture

### Frontend (`/src`)
- **App.jsx**: Main application with draft logic
- **Components**: Modular UI components
  - `TeamPanel`: Team pick/ban displays
  - `GodGrid`: Main god selection interface
  - `Chat`: Real-time messaging
  - `UsersList`: Connected users display
  - `JoinRoomModal`: Room joining interface
- **Hooks**: `useSocket.js` for real-time connection management

### Backend (`/server`)
- **Socket.IO Server**: Handles real-time communication
- **Room Management**: Auto-generated room codes, user tracking
- **Draft Sync**: Broadcasts draft state to all room members
- **Message System**: Real-time chat functionality

### Data
- **gods_merged_local.json**: Complete god database with local assets
- **Image Assets**: `/public/assets/gods/` contains god portraits

## 📁 Project Structure

```
smite-draft-tool/
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   ├── data/               # God database
│   └── App.jsx             # Main application
├── server/                 # Socket.IO backend
├── public/assets/gods/     # God images
└── package.json
```

## 🔧 Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `cd server && npm run dev` - Start multiplayer backend

## 🚀 Deployment

### Frontend (Vercel)
1. Deploy React app to Vercel
2. Set environment variable: `VITE_SERVER_URL=https://your-backend.railway.app`

### Backend (Railway/Render)
1. Deploy server folder to Railway or Render
2. Set environment variable: `CLIENT_URL=https://your-frontend.vercel.app`

## 🎯 Draft Sequence

Follows official Smite competitive format:
1. **6 Ban Phases**: ORDER → CHAOS (alternating)
2. **10 Pick Phases**: ORDER → CHAOS → CHAOS → ORDER → ORDER → CHAOS → CHAOS → ORDER → ORDER → CHAOS

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Socket.IO, Express
- **Real-time**: WebSocket connections
- **Deployment**: Vercel (frontend) + Railway (backend)

