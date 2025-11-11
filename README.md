# Agentic Veo – 8K AI Video Director

Agentic Veo is an AI-powered cinematic director that turns visionary storyboards into ultra-realistic 8K footage using Google Veo 3.1. Compose prompts, guide the mood, and capture downloadable sequences ready for trailers, ads, and storytelling.

## Features

- Creative cockpit for crafting Veo prompts, negative guidance, and deterministic seeds
- Duration, aspect ratio, style, and guidance controls tuned for 8K output
- Real-time render status with inline playback, thumbnails, and AI shot notes
- Persistent render history to review previous generations and share links

## Prerequisites

1. Enable Google Veo 3.1 via Google AI Studio or Vertex AI and create an API key
2. Duplicate `.env.local.example` to `.env.local` and set the required variables:

```bash
GOOGLE_VEO_API_KEY="your-api-key"
# optional overrides
GOOGLE_VEO_MODEL="veo-3.1-exp"
GOOGLE_VEO_API_ENDPOINT="https://generativelanguage.googleapis.com/v1beta"
```

## Local Development

```bash
cd agentic-veo
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to launch the studio.

## Production Build

```bash
cd agentic-veo
npm run build
npm start
```

## Deployment

The project is optimized for Vercel hosting. Configure the Google Veo secrets as encrypted environment variables and deploy with `vercel deploy --prod` (see provided deployment instructions).
