# AI Resume Analyzer — Frontend

A Next.js web application that allows users to submit a resume (by pasting text or uploading a PDF) and receive an AI-generated score and feedback powered by Azure OpenAI. Past analyses are stored in Azure Blob Storage and viewable in a History tab.

---

## Project Overview

| Item | Detail |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Service | Azure OpenAI (via backend API) |
| Storage | Azure Blob Storage (via backend API) |
| Deployment | Azure Static Web Apps |

---

## Features

- **Paste text** — paste resume content directly into the textarea
- **Upload PDF** — upload a PDF resume (max 5 MB, text-based PDFs only)
- **AI analysis** — score out of 100, strengths, weaknesses, and suggestions
- **History tab** — browse all past analyses stored in Azure Blob Storage
- **Error handling** — scanned/image PDFs prompt the user to switch to paste mode

---

## Local Setup

### Prerequisites

- Node.js 18 or higher
- The backend API running on `http://localhost:5000`

### Steps

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local` and set the backend URL:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000`

> The backend must be running at the same time for the Analyze and History features to work. See the backend README for setup instructions.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Express backend | `http://localhost:5000` |

No Azure credentials are needed in the frontend — all AI and storage calls go through the backend API.

---

## Project Structure

```
frontend/
└── src/
    ├── app/
    │   ├── globals.css       # Tailwind base styles
    │   ├── layout.tsx        # Root layout and font setup
    │   └── page.tsx          # Main page (Analyze + History tabs)
    ├── components/
    │   ├── AnalysisResults.tsx   # Score + feedback lists
    │   ├── HistoryList.tsx       # Past analyses list
    │   └── ScoreMeter.tsx        # 0–100 score gauge
    └── lib/
        ├── api.ts            # Backend API calls
        ├── score.ts          # Score tier logic (Needs work / Solid / Strong)
        └── types.ts          # TypeScript types matching backend response
```

---

## Backend API Contract

The frontend calls three endpoints on the backend:

### Analyze a resume

```
POST /api/analyze
```

**Option A — pasted text:**
```json
{ "text": "resume content here" }
```

**Option B — PDF upload:**
- `multipart/form-data` with a field named `resume`
- PDF only, max 5 MB

**Success response (201):**
```json
{
  "id": "uuid",
  "timestamp": "2026-06-18T...",
  "source": "text" | "pdf",
  "score": 72,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."]
}
```

### List past analyses

```
GET /api/analyses
```

### Get one analysis

```
GET /api/analyses/:id
```

---

## Azure Deployment

The frontend is deployed as a static export to **Azure Static Web Apps**.

The `next.config.js` sets `output: "export"` to generate a static build. The build output goes to the `out/` folder.

When setting up Azure Static Web Apps:
- Set **App location** to `frontend`
- Set **Output location** to `out`
- Add `NEXT_PUBLIC_API_URL` as a build environment variable pointing to the deployed backend URL

---

## Responsible AI

- **Transparency** — users are informed their resume is analyzed by AI
- **Privacy** — no resume data is stored client-side; storage is handled server-side via Azure Blob Storage
- **Reliability** — AI-generated feedback should be reviewed by the user and not treated as a final assessment
- **Inclusiveness** — the interface uses semantic HTML with proper labels for screen reader accessibility
- **Accountability** — the user remains responsible for how they interpret and act on the feedback

---

## Team Roles

| Member | Responsibility |
|---|---|
| Team Member 1 (Frontend) | UI, component structure, API integration, Azure Static Web Apps deployment |
| Team Member 2 (Backend) | Express API, Azure OpenAI integration, Azure Blob Storage, backend deployment |
