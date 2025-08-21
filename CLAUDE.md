# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run download:puppeteer` - Download god images from remote sources using Puppeteer

## Architecture Overview

This is a React + Vite + Tailwind CSS prototype for a Smite Ranked Conquest draft tool that simulates the game's pick/ban phase.

### Core Structure

- **App.jsx**: Main application containing draft logic, state management, and turn sequence
- **Components**: Modular UI components in `/src/components/`
  - `TeamPanel`: Shows team picks/bans with player slots
  - `GodGrid`: Main god selection interface with filtering
  - `GodCard`: Individual god display cards
  - `FilterBar`: Role-based filtering controls
  - `BanList`: Displays banned gods for each team
- **Data**: God information stored in JSON files in `/src/data/`
  - `gods_merged_local.json`: Primary data file with local image paths
  - Other JSON files contain variations/backups of god data

### Draft System

The draft follows a specific turn sequence defined in `DRAFT_SEQUENCE` constant:
- 6 ban phases (alternating teams)
- 10 pick phases following Smite's competitive format
- State managed through React hooks for picks, bans, and current turn

### Image Management

The project includes a Puppeteer-based image download system (`scripts/download_images_puppeteer.js`) that:
- Fetches god images from remote URLs
- Stores them locally in `/public/assets/gods/`
- Updates JSON data with local paths for offline usage

### Firebase Integration

Stubbed Firebase setup in `src/firebase.js` with placeholder configuration. Replace the config object with actual project values to enable real-time multiplayer functionality.

### Styling

Uses Tailwind CSS with dark theme (gray-900 background). The design mimics the in-game Smite draft interface with team panels on sides and god grid in center.