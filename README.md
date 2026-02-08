# Liquid Card Extractor

A modern, production-ready web application for extracting contact information from business cards using GPT Vision (Daedalus API). Features a beautiful "Liquid Glass" UI, drag-and-drop uploads, and Excel export.

## Features

- **Liquid Glass UI**: Modern, aesthetic interface with animated mesh gradients and glassmorphism.
- **AI Extraction**: Uses Daedalus/GPT Vision to extract fields like Name, Email, Phone, Company, etc.
- **Bulk Processing**: Upload multiple cards at once (concurrency limited for performance).
- **Data Normalization**: Automatically formats phone numbers and emails.
- **Excel Export**: Download edited results as `.xlsx`.
- **Local Privacy**: Images are processed in memory and not permanently stored on the server.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Copy `.env.example` to `.env.local` and add your Daedalus API key:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   DAEDALUS_API_KEY=your_key_here
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Architecture

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion.
- **Backend**: Next.js API Routes (`/api/extract`).
- **State Management**: React `useState` with optimistic UI updates.
- **Data Processing**:
  - `app/lib/daedalus.ts`: Handles API communication and resilient JSON parsing.
  - `app/lib/utils.ts`: Normalization logic.
- **Styling**: Tailwind CSS with custom variables for the glass effect in `globals.css`.

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- xlsx (SheetJS)
- Lucide React (Icons)
- Zod (Validation schema)

## License

MIT
