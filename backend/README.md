# AI Resume Analyzer — Backend API

Express backend that analyzes a resume (pasted text **or** an uploaded PDF) using Azure OpenAI (GPT-4.1) and stores each result in Azure Blob Storage. This README is everything the frontend needs to connect and start building.

---

## 1. Quick start

```bash
# from the backend/ folder
npm install
npm run dev
```

You should see:

```
Server running on http://localhost:5000
```

**Base URL (local):** `http://localhost:5000`

### Working without Azure credentials (mock mode)

If you don't have the Azure values yet, you can still run and build against the API. In `.env` set:

```
USE_MOCK=true
```

In mock mode the API returns realistic fake analysis instantly and stores records in memory, so every endpoint behaves normally — you can build and test the whole UI before any Azure resource exists. Flip it to `false` once real credentials are in place. **Records in mock mode reset when the server restarts** (that's expected).

---

## 2. Environment variables (`.env`)

The backend reads these from a `.env` file in `backend/`. You don't need to touch these to build the frontend, but here's what they are:

```
PORT=5000
USE_MOCK=false

AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/
AZURE_OPENAI_API_KEY=<key>
AZURE_OPENAI_DEPLOYMENT=<deployment name>
AZURE_OPENAI_API_VERSION=2024-10-21

AZURE_STORAGE_CONNECTION_STRING=<connection string>
AZURE_STORAGE_CONTAINER=analyses
```

> `.env` is gitignored and never committed. Secrets stay out of the codebase.

---

## 3. API contract at a glance

| Method | Path                | Purpose                        | Body                                            |
| ------ | ------------------- | ------------------------------ | ----------------------------------------------- |
| GET    | `/`                 | Health check                   | —                                               |
| POST   | `/api/analyze`      | Analyze a resume               | JSON `{ text }` **or** form-data `resume` (PDF) |
| GET    | `/api/analyses`     | List all past analyses (light) | —                                               |
| GET    | `/api/analyses/:id` | Get one full analysis          | —                                               |

`POST /api/analyze` is the only write. The two GETs are how you build a history view.

---

## 4. Endpoints in detail

### `GET /` — health check

Quick "is the server up" check.

```json
{ "message": "AI Resume Analyzer API running", "status": "ok" }
```

---

### `POST /api/analyze` — analyze a resume

Accepts the resume **one of two ways**. The endpoint figures out which automatically.

**Option A — pasted text (JSON):**

- Header: `Content-Type: application/json`
- Body: `{ "text": "the full resume text..." }`

**Option B — PDF upload (multipart/form-data):**

- Body: form-data with a field named **`resume`** (type: File), holding the PDF
- Constraints: **PDF only**, **max 5 MB**
- Do **not** set the `Content-Type` header yourself (see gotcha in §6)

**Success — `201 Created`:**

```json
{
  "id": "7f3bccba-5d06-4b14-a726-d98c0fd905de",
  "timestamp": "2026-06-17T15:12:44.634Z",
  "source": "pdf",
  "resumeText": "Full extracted or pasted resume text...",
  "score": 65,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "suggestions": ["...", "..."],
  "storage": { "stored": true, "blobName": "7f3bccba-....json" }
}
```

- `source` is `"pdf"` or `"text"` depending on how it came in.
- `score` is 0–100.
- `strengths` / `weaknesses` / `suggestions` are arrays of strings — render them as lists.

---

### `GET /api/analyses` — list past analyses

Light list for a history view. Sorted newest-first. Does **not** include full resume text (use the detail endpoint for that).

```json
{
  "count": 1,
  "analyses": [
    {
      "id": "7f3bccba-5d06-4b14-a726-d98c0fd905de",
      "timestamp": "2026-06-17T15:12:44.634Z",
      "score": 65,
      "source": "pdf",
      "preview": "Leke Adeyemo 403-... PROFILE SUMMARY A dedicated..."
    }
  ]
}
```

---

### `GET /api/analyses/:id` — get one full analysis

Returns the complete stored record (same shape as the `POST` success above, minus the `storage` field). `404` if the id doesn't exist.

---

## 5. Error responses

Every error returns JSON with an `error` field containing a human-readable message you can show the user directly.

| Status | When it happens                          | `error` message                                                                                       |
| ------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `400`  | No text and no file provided             | "Provide a resume: upload a PDF (field 'resume') or paste text (field 'text')."                       |
| `422`  | PDF has no readable text (scanned/image) | "Couldn't read text from this PDF (it may be a scanned image). Please paste the resume text instead." |
| `415`  | Uploaded file isn't a PDF                | "Only PDF files are accepted. Paste the text instead if it isn't a PDF."                              |
| `413`  | PDF larger than 5 MB                     | "PDF is too large (max 5 MB)."                                                                        |
| `404`  | `GET /api/analyses/:id` with unknown id  | "Analysis not found."                                                                                 |
| `500`  | Unexpected server/Azure error            | "Failed to analyze resume." (plus `detail`)                                                           |

**Important UX one:** the `422` is the designed fallback. If a user uploads a scanned PDF, catch this status and prompt them to paste the text instead — that's how the two input paths back each other up.

---

## 6. Frontend integration

CORS is enabled on the backend, so a frontend on `http://localhost:3000` can call `http://localhost:5000` directly in dev.

**Tip:** put the base URL in a frontend env var so swapping to the deployed URL later is one change:

```
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Analyze — pasted text

```javascript
const API = process.env.NEXT_PUBLIC_API_URL;

async function analyzeText(resumeText) {
  const res = await fetch(`${API}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: resumeText }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error); // data.error is user-friendly
  return data; // { score, strengths, weaknesses, suggestions, ... }
}
```

### Analyze — PDF upload

```javascript
const API = process.env.NEXT_PUBLIC_API_URL;

async function analyzePdf(file) {
  const formData = new FormData();
  formData.append("resume", file); // field name MUST be "resume"

  const res = await fetch(`${API}/api/analyze`, {
    method: "POST",
    body: formData,
    // ⚠️ Do NOT set Content-Type here. The browser sets it automatically,
    // including the multipart boundary. Setting it by hand breaks the upload.
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}
```

### History — list + detail

```javascript
const API = process.env.NEXT_PUBLIC_API_URL;

async function listAnalyses() {
  const res = await fetch(`${API}/api/analyses`);
  const { count, analyses } = await res.json();
  return analyses; // [{ id, timestamp, score, source, preview }]
}

async function getAnalysis(id) {
  const res = await fetch(`${API}/api/analyses/${id}`);
  if (res.status === 404) return null;
  return res.json(); // full record
}
```

---

## 7. Common gotchas

- **`/api/analyze` is POST-only.** Opening it in a browser (a GET) returns "Cannot GET /api/analyze" — that's expected, not a bug.
- **Never set `Content-Type` manually for the PDF upload.** Let the browser set it so it includes the multipart boundary. (Hand-setting it causes an "Unexpected end of form" error on the server.)
- **The file field must be named `resume`** — that's what the backend's `upload.single("resume")` expects.
- **Scanned PDFs return `422`, not a crash.** Handle that status by suggesting the paste option.
- **In mock mode, history resets on server restart.** Real storage persists.

---

## 8. Minimal end-to-end example (paste path with error handling)

```javascript
async function handleAnalyze(resumeText) {
  try {
    const result = await analyzeText(resumeText);
    // result.score, result.strengths[], result.weaknesses[], result.suggestions[]
    renderResults(result);
  } catch (err) {
    showError(err.message); // already user-friendly from the API
  }
}
```

That's the whole loop: send the resume, get back score + feedback arrays, render them. The PDF path is identical except it sends `FormData`.
