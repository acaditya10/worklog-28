# 📋 Worklog

> AI-powered work activity logger — describe what you did, and AI structures it into a professional job sheet.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)
![Gemini](https://img.shields.io/badge/Gemini_AI-powered-4285F4?logo=google)

## ✨ Features

- **Natural Language Input** — Describe your work in plain English; AI parses it into structured entries with task name, description, category, and duration.
- **Smart Parsing** — Powered by Gemini 3 Flash for fast, accurate extraction of multiple tasks from a single input.
- **Preview & Edit** — Review AI-parsed entries before saving. Edit any field inline before confirming.
- **Dashboard** — Browse all entries with search, category filters, and date grouping.
- **AI Summaries** — Generate professional status reports (daily, weekly, monthly, all-time) powered by Gemini 3.1 Pro.
- **Dark Theme** — Sleek, minimal dark UI built with shadcn/ui and TailwindCSS.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 4 + shadcn/ui |
| Database | Firebase Firestore |
| AI | Google Gemini API |
| Icons | Lucide React |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── parse/route.ts        # AI text → structured entries
│   │   └── summarize/route.ts    # AI entries → status report
│   ├── dashboard/page.tsx        # Dashboard with search, filters, summaries
│   ├── layout.tsx                # Root layout (Inter font, dark theme)
│   ├── page.tsx                  # Main log page
│   └── globals.css               # TailwindCSS v4 theme
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── nav.tsx                   # Navigation bar
│   ├── entry-card.tsx            # Entry display card
│   ├── entry-preview.tsx         # AI parse preview (editable)
│   ├── edit-dialog.tsx           # Entry edit modal
│   └── summary-section.tsx       # Tabbed AI summary viewer
└── lib/
    ├── firebase.ts               # Firebase init + CRUD operations
    ├── types.ts                  # TypeScript interfaces
    └── utils.ts                  # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase project](https://console.firebase.google.com/) with Firestore enabled
- A [Gemini API key](https://ai.google.dev/)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/acaditya10/worklog-28.git
   cd worklog-28
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## 📖 Usage

1. **Log your work** — Type a natural language description of what you did on the home page.
2. **Review** — AI parses your input into structured entries. Edit or remove any before saving.
3. **Dashboard** — View all entries, filter by category, search by keyword.
4. **Generate Reports** — Click "Refresh" on any summary tab to generate an AI-powered status report.

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 📄 License

This project is for personal use.
