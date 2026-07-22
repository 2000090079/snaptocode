# SnapToCode

Upload a screenshot of any website and get back production-ready
**React + Tailwind CSS** code that replicates the design — powered by
GPT-4o Vision.

## Features

- **Drag-and-drop or click-to-browse upload** with client-side
  validation (type and 5MB size limit)
- **AI-powered design analysis** — detects sections, components, and
  layout from a single screenshot
- **Generated React + Tailwind code** with syntax-highlighted,
  line-numbered output and one-click copy
- **Live in-browser preview** of the generated component, sandboxed in
  an iframe
- Clean two-column result view: screenshot + description on the left,
  code/preview tabs on the right

## Tech stack

| Layer    | Technology                          |
|----------|--------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, lucide-react |
| Backend  | Node.js, Express, Multer             |
| AI       | OpenAI GPT-4o Vision API             |

## Project structure

```
snaptocode/
├── backend/
│   ├── server.js      # Express app, /api routes
│   ├── analyze.js      # GPT-4o Vision call
│   └── prompts.js      # System prompt for code generation
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── Uploader.jsx     # Drag & drop upload
│   │       ├── CodeOutput.jsx   # Generated code display
│   │       └── Preview.jsx      # Sandboxed live preview
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Getting started

### Prerequisites
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/account/api-keys) with GPT-4o access

### 1. Backend
```bash
cd backend
npm install
OPENAI_API_KEY=your_key npm start
```
Runs on `http://localhost:3001`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api/*` requests to the backend.

Open `http://localhost:5173` and upload a screenshot.

## Environment variables

| Variable         | Where    | Required | Description                        |
|-------------------|---------|----------|--------------------------------------|
| `OPENAI_API_KEY`  | backend | yes      | OpenAI API key with GPT-4o access    |
| `PORT`            | backend | no       | Backend port (default `3001`)        |

## API

### `POST /api/analyze`
Multipart form upload, field name `image`. Accepts JPG, PNG, WebP, GIF up to 5MB.

Response:
```json
{
  "description": "Brief description of the UI",
  "components": ["Navbar", "Hero", "Footer"],
  "code": "export default function Generated() { ... }"
}
```

### `GET /api/health`
Returns `{ "status": "ok" }`.

## Known limitations

- The in-app **Preview** tab loads React, Babel Standalone, and
  Tailwind from CDN inside a sandboxed iframe — it has no bundler or
  module resolution, so `lucide-react` icons render as generic
  placeholder glyphs rather than the real icon set. Copy the code and
  run it in a real project for full fidelity.
- Generated code is a best-effort reproduction of the screenshot, not
  a pixel-perfect clone.

## Real bugs found and fixed during development

1. **Vulnerable Multer version.** `npm install` flagged Multer 1.x as
   affected by known CVEs. Upgraded to Multer 2.x, a drop-in
   replacement for the `memoryStorage` + `single()` usage here.

2. **Missing Vite entry point and Tailwind build config.** The initial
   scaffold had `index.html` pointing at `/src/main.jsx` and
   `index.css` using `@tailwind` directives, but no `main.jsx`,
   `tailwind.config.js`, or `postcss.config.js` existed yet — `npm run
   build` failed immediately. Added all three so the Tailwind pipeline
   and React mount actually run.

3. **Live Preview tab crashed on every generated result.** The GPT-4o
   prompt always produces `import { X } from 'lucide-react'` and
   `export default function ...`, but the CDN-only `srcdoc` sandbox
   (React + Babel Standalone via `<script>` tags, no bundler) has no
   module resolution — both statements threw immediately and blanked
   the iframe. Fixed by rewriting the code before injection: strip
   `import` lines, rebind `export default` to `window.GeneratedComponent`,
   and generate lightweight stub components for any `lucide-react`
   icons referenced, wrapped in a try/catch that renders the error
   message instead of a blank screen.

## License

MIT
