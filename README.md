# Smite Draft Tool — Prototype

This is a lightweight React + Vite + Tailwind prototype for an interactive Smite Ranked Conquest draft tool.

What I created:
- Frontend scaffold (Vite + React)
- Tailwind CSS configuration
- Components: TeamPanel, PlayerSlot, GodGrid, GodCard, FilterBar, BanList
- Sample local `gods.json` with placeholder images
- Simple client-side draft flow (single-user) implemented in `src/App.jsx`
- Minimal Firebase wiring stub in `src/firebase.js` (replace with your config)

Quick start (requires Node.js 18+):

```bash
npm install
npm run dev
```

Open the shown URL to try the UI. Click gods in the center to perform bans/picks according to the current turn.

Next steps I can do for you:
- Implement real-time sync with Firestore (sessions + shareable URLs)
- Implement exact Smite draft order and per-player slots (assign players to slots)
- Polish UI to closely match the in-game screenshot (animations, styling)

