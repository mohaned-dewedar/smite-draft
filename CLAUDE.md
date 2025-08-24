# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start frontend development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `cd server && npm run dev` - Start Socket.IO backend server for multiplayer
- `npm run download:puppeteer` - Download god images from remote sources using Puppeteer

## Architecture Overview

This is a real-time multiplayer Smite Ranked Conquest draft tool built with React + Vite + Tailwind CSS + Socket.IO.

### Core Structure

- **App.jsx**: Main application with draft logic and multiplayer room management
- **Components**: Modular UI components in `/src/components/`
  - `TeamPanel`: Shows team picks/bans with player slots
  - `GodGrid`: Main god selection interface with filtering
  - `GodCard`: Individual god display cards
  - `FilterBar`: Role-based filtering controls
  - `BanList`: Displays banned gods for each team
  - `Chat`: Real-time messaging for multiplayer rooms
  - `UsersList`: Shows connected users in multiplayer
  - `JoinRoomModal`: Interface for joining rooms by code
- **Hooks**: Custom hooks in `/src/hooks/`
  - `useSocket.js`: Manages Socket.IO connection and real-time state
- **Data**: God information stored in JSON files in `/src/data/`
  - `gods_merged_local.json`: Primary data file with local image paths

### Draft System Modes

**Single-Player Mode (Default)**
- Offline drafting for practice
- No server connection required
- Local state management only

**Multiplayer Mode**
- Real-time synchronization via Socket.IO
- Room-based system with 6-character codes
- All room members can draft together
- Live chat functionality

### Draft Sequence

The draft follows Smite's competitive format defined in `DRAFT_SEQUENCE` constant:
- 6 ban phases (ORDER → CHAOS alternating)
- 10 pick phases: ORDER → CHAOS → CHAOS → ORDER → ORDER → CHAOS → CHAOS → ORDER → ORDER → CHAOS
- State synced across all room members in multiplayer

### Multiplayer System

**Frontend (`/src`)**
- Socket.IO client connection
- Real-time state synchronization 
- Conflict prevention during simultaneous updates
- Auto-join via URL parameters

**Backend (`/server`)**
- Socket.IO server with Express
- In-memory room management
- Real-time draft state broadcasting
- Message system for chat

**Room Management**
- Auto-generated 6-character room codes
- URL sharing: `?room=ROOMID`
- User presence tracking
- Automatic cleanup of empty rooms

### Image Management

The project includes a Puppeteer-based image download system (`scripts/download_images_puppeteer.js`) that:
- Fetches god images from remote URLs
- Stores them locally in `/public/assets/gods/`
- Updates JSON data with local paths for offline usage

### Styling

Uses Tailwind CSS with dark theme (gray-900 background). The design mimics the in-game Smite draft interface with team panels on sides and god grid in center. Responsive design works on mobile and desktop.

### Deployment

**Frontend**: Deploy to Vercel with `VITE_SERVER_URL` environment variable
**Backend**: Deploy to Railway/Render with `CLIENT_URL` environment variable

### Key Features

- **Collaborative Drafting**: Everyone in room can pick/ban
- **Real-time Sync**: Instant updates across all clients
- **Conflict Prevention**: Smart sync logic prevents infinite loops
- **Mobile Responsive**: Works on all screen sizes
- **Auto-join Links**: Shareable URLs for easy room access
- **Live Chat**: Communicate during drafts