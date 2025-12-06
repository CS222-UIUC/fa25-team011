# JamGram

JamGram is a Next.js application that pairs photo analysis with Spotify data to recommend music that matches the mood of your images. Upload a picture, see AI-extracted tags and colors, and chat about tailored song suggestions that blend your visual vibe with your listening history.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Available Scripts](#available-scripts)
- [Running Tests](#running-tests)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Notes](#notes)

## Features
- **Image uploads with HEIC support** – Drag-and-drop or select images (including Safari HEIC files) with automatic preview generation and conversion when possible.\
  Displays detected objects, dominant colors, and inferred mood after AI analysis.【F:jamgram/app/components/ImageUpload.tsx†L1-L197】【F:jamgram/app/components/ImageUpload.tsx†L197-L220】
- **AI-powered image tagging** – The `/api/extract-tags` route calls Hugging Face vision models to classify objects, caption the photo, and infer colors/mood, returning structured JSON for the UI.【F:jamgram/app/api/extract-tags/route.js†L1-L205】【F:jamgram/app/api/extract-tags/route.js†L205-L278】
- **Recommendation chat panel** – Converse about the uploaded image and preview recommended tracks, including album art and optional audio snippets for quick listening.【F:jamgram/app/components/ChatPanel.tsx†L1-L175】【F:jamgram/app/components/RecommendedSongCard.tsx†L1-L36】
- **Spotify-authenticated experiences** – Sign in with Spotify via NextAuth to access listening data, analyze top artists and recent plays, and feed them into OpenAI for recommendation prompts.【F:jamgram/app/api/auth/[...nextauth]/route.js†L1-L38】【F:jamgram/app/api/spotify/analyze/route.js†L1-L56】
- **Modern UI** – Built with the Next.js App Router, Tailwind CSS styling, and responsive layouts so the uploader and chat fit side-by-side on large screens.【F:jamgram/app/page.tsx†L1-L10】【F:jamgram/tailwind.config.ts†L1-L12】

## Tech Stack
- **Framework:** Next.js 15 (App Router) with React 19
- **Styling:** Tailwind CSS 4
- **Authentication:** NextAuth.js with Spotify provider
- **AI/ML:** Hugging Face Inference API for vision and LLM calls; OpenAI for playlist prompts
- **Testing:** Jest + React Testing Library; Cypress for E2E

## Project Structure
```
fa25-team011/
└── jamgram/
    ├── app/
    │   ├── api/                # Server routes (auth, spotify, image tagging)
    │   ├── components/         # Client components (uploader, chat, cards)
    │   ├── utils/              # Client helpers (e.g., extractTags)
    │   ├── layout.tsx          # Root layout
    │   └── page.tsx            # Home page combining upload + chat
    ├── public/                 # Static assets
    ├── styles/                 # Global styles
    └── package.json
```

## Prerequisites
- Node.js 18.18+ (Node 20 recommended)
- npm 9+
- Access tokens for Spotify, OpenAI, and Hugging Face (see below)

## Setup
1. Install dependencies:
   ```bash
   cd jamgram
   npm install
   ```
2. Create a `.env.local` file in `jamgram/` with the required variables (see [Environment Variables](#environment-variables)).
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app runs at http://localhost:3000 by default.

## Available Scripts
- `npm run dev` – Start the dev server (Turbopack).
- `npm run build` – Create a production build.
- `npm start` – Run the production server after building.
- `npm run lint` / `npm run lint:fix` – Lint the project (optionally auto-fix issues).
- `npm test` – Run unit tests with Jest.
- `npm run test:coverage` – Generate unit test coverage.
- `npm run cypress` – Open Cypress in headed mode.
- `npm run cypress:headless` – Run Cypress tests headlessly.
- `npm run test:e2e` – Start the dev server and execute headless Cypress tests.

## Running Tests
- Unit tests:
  ```bash
  npm test
  ```
- End-to-end tests (requires the dev server to be available on port 3002):
  ```bash
  npm run test:e2e
  ```

## Environment Variables
Create `jamgram/.env.local` with the following keys:

```env
# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# OpenAI (used by Spotify analysis route)
OPENAI_API_KEY=your_openai_api_key

# Hugging Face (used by /api/extract-tags)
HF_TOKEN=your_huggingface_token
```

## API Overview
- `POST /api/extract-tags` – Accepts form-data `image` file. Uses Hugging Face models to return detected objects, colors, and mood for the image.【F:jamgram/app/api/extract-tags/route.js†L1-L205】
- `GET /api/spotify/analyze` – Requires Spotify-authenticated session. Fetches top artists and recent plays, then calls OpenAI to produce song recommendations informed by image features.【F:jamgram/app/api/spotify/analyze/route.js†L1-L56】
- `GET /api/spotify/recently-played` / `GET /api/spotify/top-artists` – Proxy routes to Spotify Web API for the signed-in user. 【F:jamgram/app/api/spotify/recently-played.js†L1-L49】【F:jamgram/app/api/spotify/top-artists.js†L1-L49】

## Notes
- HEIC uploads rely on browser support for `createImageBitmap` (Safari). Non-supporting browsers will show a friendly error after attempting conversion.【F:jamgram/app/components/ImageUpload.tsx†L22-L72】
- The chat panel currently uses placeholder song data until wired to backend recommendations; it still displays the latest suggested track with album art and optional preview audio.【F:jamgram/app/components/ChatPanel.tsx†L24-L78】【F:jamgram/app/components/RecommendedSongCard.tsx†L9-L33】
- Ensure the `HF_TOKEN` is valid; the vision and LLM endpoints use the Hugging Face router domain (`hf-inference`).【F:jamgram/app/api/extract-tags/route.js†L13-L31】

## Developers
- **Shivi Narang — Backend:** Leads server-side integrations, maintains AI tagging pipelines, ensuring reliable Hugging Face inference for object detection, captioning, and color/mood extraction. 
- **Caroline Feng — Frontend:** Drives UI/UX for the home experience, wiring the App Router layout with responsive styling and user-friendly flows for upload and chat surfaces.
- **Vittoria Gallina — Frontend:** Focuses on reusable visual components, such as the chat panel, recommended song cards, and stateful interactions that present AI outputs clearly.
- **Taniya Agarwal — Backend:** Spotify auth/session flow and data analysis routes that combine OpenAI prompts with user listening history.
