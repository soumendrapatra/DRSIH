# Retina AI Analysis Viewer

A clinical-tech **Wizard-of-Oz AI demo** with **blind-selection mode**: the File Explorer reveals nothing about a sample until selected — verified at the network level in browser DevTools.

---

## 🚀 Quick Start (Local Development)

You can run the full local development stack with concurrently:

```bash
# 1. Install dependencies across all packages
npm run install:all

# 2. Start local Express backend + Vite frontend together
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:4000`

---

## 🌐 Netlify Deployment Guide

This project is pre-configured for seamless zero-config deployment to **Netlify** using Netlify Functions and static asset CDN distribution.

### Option A: Deploy via GitHub / GitLab / Bitbucket
1. Push this repository to your Git provider.
2. In the Netlify Dashboard, click **Add new site** → **Import an existing project**.
3. Select your repository.
4. Netlify will automatically detect [`netlify.toml`](netlify.toml) with:
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
   - **Functions directory**: `netlify/functions`
5. Click **Deploy Site**.

### Option B: Deploy via Netlify CLI
```bash
# Build production bundle
npm run build

# Deploy to Netlify
npx netlify deploy --prod
```

---

## 📁 Folder & Data Contract

All sample images and data live in `sample-folder/`:

```
sample-folder/
├── images/
│   ├── 01.png          ← any image extension: png, jpg, jpeg
│   ├── 02.png
│   └── ...
└── data/
    ├── 01.json         ← numeric id is the join key
    ├── 02.json
    └── ...
```

### Adding New Samples
1. Drop your fundus image in `sample-folder/images/<id>.<ext>` (e.g. `04.png`).
2. Drop your matching analysis JSON in `sample-folder/data/<id>.json` (e.g. `04.json`).
3. For local Express, new files appear automatically on page refresh.
4. For Netlify, push to Git to trigger a build (which bundles the images and generates the function manifest).

---

## 📋 JSON Schema (`data/<id>.json`)

```json
{
  "id": "01",
  "category": "Moderate NPDR",
  "displayName": "Sample 01",
  "condition": "Diabetic Retinopathy",
  "confidence": 0.94,
  "severity": "Moderate",
  "findings": [
    "Microaneurysms detected in the superior temporal quadrant",
    "Hard exudates present near the foveal region"
  ],
  "vesselAnalysis": {
    "arteriovenousRatio": "2:3 (borderline)",
    "tortuosity": "Mild venous tortuosity",
    "neovascularization": "Absent"
  },
  "maculaStatus": "Subtle thickening noted on clinical exam.",
  "opticDiscStatus": "Disc margins sharp; cup-to-disc ratio 0.4.",
  "riskIndicators": [
    "Uncontrolled HbA1c > 8%",
    "Duration of diabetes > 10 years"
  ],
  "recommendation": "Refer to retinal specialist within 2 weeks.",
  "analysisSummary": "The AI model identified characteristics consistent with moderate NPDR.",
  "differentialConsiderations": "Hypertensive retinopathy excluded.",
  "processingTimeMs": 1842
}
```

- **`category`**: Free-text string displayed as-is (e.g., `"Moderate NPDR"`, `"Grade 2 — Mild"`, `"No apparent DR"`).
- **`originalImage`**: Attached automatically by the backend/serverless function at request time.
- **Optional sections**: `vesselAnalysis`, `maculaStatus`, `opticDiscStatus`, `riskIndicators`, and `differentialConsiderations` render only when present and non-empty.

---

## 🔒 Blind-Selection Contract (Network Level)

| Endpoint | Method | Payload / Response | Purpose |
|---|---|---|---|
| `/api/images` | `GET` | `[{ id, slotLabel }]` | Returns generic sequential labels only (`Sample 01`). No image paths, categories, conditions, or severity are leaked in DevTools. |
| `/api/analysis/:id` | `GET` | Full JSON + `originalImage` URL | Triggered only after the user selects a sealed card. |

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion, Vite
- **Backend (Local)**: Node.js, Express (ESM)
- **Backend (Production)**: Netlify Serverless Functions + Static Asset CDN
