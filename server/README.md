# Smite Draft Server

Socket.IO server for real-time multiplayer draft functionality.

## Features

- ✅ Room creation and joining
- ✅ Real-time draft state synchronization
- ✅ Live chat messaging
- ✅ Voting system for spectators
- ✅ User presence tracking
- ✅ Role-based permissions

## Development

```bash
# Install dependencies
cd server
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Deployment

### Railway (Recommended)

1. Connect your GitHub repo to Railway
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`
4. Set environment variables:
   - `PORT=3001` (optional, Railway sets this automatically)
   - `CLIENT_URL=https://your-vercel-app.vercel.app`

### Render

1. Create new Web Service
2. Build Command: `cd server && npm install` 
3. Start Command: `cd server && npm start`
4. Environment Variables:
   - `CLIENT_URL=https://your-vercel-app.vercel.app`

## Environment Variables

- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:5173)

## API Endpoints

- `GET /health` - Health check
- `GET /room/:roomId` - Get room information

## Room Management

- Rooms are created with 6-character alphanumeric codes
- Empty rooms are automatically cleaned up
- Messages are limited to last 100 per room
- In-memory storage (use Redis in production for scaling)

## User Roles

- `player1` - Order team player (can draft)
- `player2` - Chaos team player (can draft)  
- `spectator` - Observer (can chat and vote)