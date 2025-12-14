# JamGram

JamGram is a Next.js application that pairs photo analysis with Spotify data to recommend music that matches the mood of your images. Upload a picture, see AI-extracted tags and colors, and chat about tailored song suggestions that blend your visual vibe with your listening history.

For more details, view the full project proposal [here](https://docs.google.com/document/d/1RL4AwoUuZwGni3cGQA3tgS-AmTcSKMTdFVit1KK_uWU/edit?usp=sharing).

## Table of Contents
- [Developers](#developers)
- [Technical Architecture](#technical-architecture)
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

## Developers
- **Shivi Narang — Backend:** Leads server-side integrations, maintains AI tagging pipelines, ensuring reliable Hugging Face inference for object detection, captioning, and color/mood extraction. 
- **Caroline Feng — Frontend:** Drives UI/UX for the home experience, wiring the App Router layout with responsive styling and user-friendly flows for upload and chat surfaces.
- **Vittoria Gallina — Frontend:** Focuses on reusable visual components, such as the chat panel, recommended song cards, and stateful interactions that present AI outputs clearly.
- **Taniya Agarwal — Backend:** Spotify auth/session flow and data analysis routes that combine OpenAI prompts with user listening history.

## Technical Architecture
- **User input pipeline** – Drag-and-drop uploads (including HEIC detection and browser-side conversion where possible) create previews, then send the file to `/api/extract-tags` for AI processing.
- **Vision + mood extraction** – `/api/extract-tags` calls Hugging Face for image classification, captioning, and a small LLM pass to infer dominant colors and mood. Partial results are returned even when a model is loading.
- **Spotify session + data ingestion** – Users authenticate with Spotify via NextAuth; authenticated requests to `/api/spotify/recently-played` and `/api/spotify/top-artists` proxy the Spotify Web API to surface listening context.
- **LLM orchestration** – The `/api/generate-recommendations` route blends extracted image objects with Spotify history and (optionally) a user instruction, then calls Groq (Llama 3.1) to produce a 10-song list labeled with an overall mood line.
- **Presentation layer** – The chat panel displays the Groq mood summary and song list while retaining the extracted objects for follow-up prompts; the header shows Connect/Sign Out controls tied to the NextAuth session.

## Features
- **Image uploads with HEIC support** – Drag-and-drop or select images (including Safari HEIC files) with automatic preview generation and conversion when possible.\
  Displays detected objects, dominant colors, and inferred mood after AI analysis.
- **AI-powered image tagging** – The `/api/extract-tags` route calls Hugging Face vision models to classify objects, caption the photo, and infer colors/mood, returning structured JSON for the UI.
- **Recommendation chat panel** – Converse about the uploaded image and preview recommended tracks, including album art and optional audio snippets for quick listening.
- **Spotify-authenticated experiences** – Sign in with Spotify via NextAuth to access listening data, analyze top artists and recent plays, and feed them into OpenAI for recommendation prompts.
- **Modern UI** – Built with the Next.js App Router, Tailwind CSS styling, and responsive layouts so the uploader and chat fit side-by-side on large screens. 

## Tech Stack
- **Framework:** Next.js 15 (App Router) with React 19
- **Styling:** Tailwind CSS 4
- **Authentication:** NextAuth.js with Spotify provider
- **AI/ML:** Hugging Face Inference API for vision and LLM calls + mood extraction; Groq Llama 3.1 chat completions for playlist generation
- **Testing:** Jest + React Testing Library; Cypress for E2E

## Project Structure
```
fa25-team011/
└── jamgram/
    ├── app/
    │   ├── api/                # Server routes (auth, spotify, image tagging, Groq recommendations))
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
- Access tokens for Spotify, Hugging Face, Groq

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

# Hugging Face (used by /api/extract-tags)
HF_TOKEN=your_huggingface_token

# Groq (used by /api/generate-recommendations)
GROK_KEY=your_groq_api_key
GROK_MODEL=llama-3.1-8b-instant
```

## API Overview
- `POST /api/extract-tags` – Accepts form-data `image` file. Uses Hugging Face models to return detected objects, colors, and mood for the image.
- `POST /api/generate-recommendations` – Requires a Spotify-authenticated session. Blends extracted image objects, recently played tracks, and top artists, then calls Groq to return a mood line plus 10 song picks.
- `GET /api/spotify/recently-played` / `GET /api/spotify/top-artists` – Proxy routes to Spotify Web API for the signed-in user.

## Notes
- HEIC uploads rely on browser support for `createImageBitmap` (Safari). Non-supporting browsers will show a friendly error after attempting conversion.
- Groq requests require a valid `GROK_KEY`; check server logs for 401 responses when the Spotify session is missing.
- Hugging Face endpoints use the router domain (`hf-inference`) and may return partial data while models warm up.
