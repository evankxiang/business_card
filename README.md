# Business Card Catalog

Local app that allows for lab members to upload business cards into a common database that may be printed and used for reference. Scanned using Claude Opus 4.5 via Dedalus API. 

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
